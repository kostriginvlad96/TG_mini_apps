const express = require('express');
const jwt = require('jsonwebtoken');
const { query, queryOne } = require('../database/connection');

const router = express.Router();

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Создание заказа
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { items, total_amount, payment_method } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Корзина пуста' });
    }

    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: 'Неверная сумма заказа' });
    }

    // Проверка наличия товаров
    for (const item of items) {
      const product = await queryOne(
        'SELECT * FROM products WHERE id = ? AND is_active = 1 AND stock_quantity >= ?',
        [item.product_id, item.quantity]
      );

      if (!product) {
        return res.status(400).json({ 
          error: `Товар с ID ${item.product_id} недоступен или отсутствует в нужном количестве` 
        });
      }
    }

    // Создание заказа
    const orderResult = await query(
      `INSERT INTO orders (user_id, total_amount, payment_method, status) 
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, total_amount, payment_method]
    );

    const orderId = orderResult.insertId || orderResult.lastID;

    // Добавление товаров в заказ
    for (const item of items) {
      await query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );

      // Обновление количества товара на складе
      await query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // Получение созданного заказа с товарами
    const order = await queryOne(`
      SELECT o.*, u.username, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [orderId]);

    const orderItems = await query(`
      SELECT oi.*, p.name, p.image_url, c.name as category_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `, [orderId]);

    res.json({
      success: true,
      order: {
        ...order,
        items: orderItems.rows || orderItems
      }
    });

  } catch (error) {
    console.error('Ошибка создания заказа:', error);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// Получение заказов пользователя
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['o.user_id = ?'];
    let params = [req.user.id];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`o.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Получение общего количества заказов
    const countQuery = `SELECT COUNT(*) as total FROM orders o WHERE ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult.rows ? countResult.rows[0].total : countResult[0].total;

    // Получение заказов с пагинацией
    const ordersQuery = `
      SELECT o.*, 
             COUNT(oi.id) as items_count,
             SUM(oi.quantity) as total_items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE ${whereClause}
      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const orders = await query(ordersQuery, params);

    res.json({
      orders: orders.rows || orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения заказов:', error);
    res.status(500).json({ error: 'Ошибка получения заказов' });
  }
});

// Получение заказа по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Получение заказа
    const order = await queryOne(`
      SELECT o.*, u.username, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, req.user.id]);

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Получение товаров заказа
    const orderItems = await query(`
      SELECT oi.*, p.name, p.image_url, p.description, c.name as category_name
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE oi.order_id = ?
    `, [id]);

    // Получение информации о платеже
    const payment = await queryOne(
      'SELECT * FROM payments WHERE order_id = ?',
      [id]
    );

    res.json({
      order: {
        ...order,
        items: orderItems.rows || orderItems,
        payment
      }
    });

  } catch (error) {
    console.error('Ошибка получения заказа:', error);
    res.status(500).json({ error: 'Ошибка получения заказа' });
  }
});

// Отмена заказа
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка существования заказа
    const order = await queryOne(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Заказ нельзя отменить в текущем статусе' });
    }

    // Отмена заказа
    await query(
      'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['cancelled', id]
    );

    // Возврат товаров на склад
    const orderItems = await query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );

    for (const item of orderItems.rows || orderItems) {
      await query(
        'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    res.json({ success: true, message: 'Заказ отменен' });

  } catch (error) {
    console.error('Ошибка отмены заказа:', error);
    res.status(500).json({ error: 'Ошибка отмены заказа' });
  }
});

// Получение статистики заказов
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await queryOne(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_spent,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders
      FROM orders 
      WHERE user_id = ?
    `, [req.user.id]);

    res.json({ stats });
  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
});

module.exports = router;
