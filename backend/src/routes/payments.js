const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
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

// Создание платежа через Telegram
router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { order_id, amount, currency = 'RUB', title, description } = req.body;

    if (!order_id || !amount || !title) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    // Проверка существования заказа
    const order = await queryOne(
      'SELECT * FROM orders WHERE id = ? AND user_id = ?',
      [order_id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ error: 'Заказ уже оплачен или отменен' });
    }

    // Создание платежа в базе данных
    const paymentResult = await query(
      `INSERT INTO payments (order_id, amount, currency, status) 
       VALUES (?, ?, ?, 'pending')`,
      [order_id, amount, currency]
    );

    const paymentId = paymentResult.insertId || paymentResult.lastID;

    // Создание платежа через Telegram Bot API
    const telegramPaymentData = {
      chat_id: req.user.telegram_id,
      title: title,
      description: description || `Оплата заказа #${order_id}`,
      payload: JSON.stringify({ order_id, payment_id: paymentId }),
      provider_token: process.env.TELEGRAM_PAYMENT_TOKEN,
      currency: currency,
      prices: [
        {
          label: title,
          amount: Math.round(amount * 100) // Telegram требует сумму в копейках
        }
      ],
      start_parameter: `order_${order_id}`,
      photo_url: 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=БАБКИН+ВНУК',
      photo_size: 300,
      photo_width: 300,
      photo_height: 200,
      need_name: false,
      need_phone_number: false,
      need_email: false,
      need_shipping_address: false,
      send_phone_number_to_provider: false,
      send_email_to_provider: false,
      is_flexible: false
    };

    const telegramResponse = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendInvoice`,
      telegramPaymentData
    );

    if (!telegramResponse.data.ok) {
      throw new Error('Ошибка создания платежа в Telegram');
    }

    // Обновление платежа с информацией от Telegram
    await query(
      `UPDATE payments SET telegram_payment_charge_id = ? WHERE id = ?`,
      [telegramResponse.data.result.invoice_id, paymentId]
    );

    res.json({
      success: true,
      payment: {
        id: paymentId,
        order_id,
        amount,
        currency,
        status: 'pending',
        telegram_invoice_id: telegramResponse.data.result.invoice_id
      }
    });

  } catch (error) {
    console.error('Ошибка создания платежа:', error);
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

// Обработка успешного платежа (webhook от Telegram)
router.post('/webhook', async (req, res) => {
  try {
    const { 
      update_id, 
      pre_checkout_query, 
      successful_payment 
    } = req.body;

    if (successful_payment) {
      const { 
        telegram_payment_charge_id, 
        provider_payment_charge_id,
        currency,
        total_amount,
        invoice_payload 
      } = successful_payment;

      const payload = JSON.parse(invoice_payload);
      const { order_id, payment_id } = payload;

      // Обновление статуса платежа
      await query(
        `UPDATE payments SET 
         status = 'completed',
         telegram_payment_charge_id = ?
         WHERE id = ?`,
        [telegram_payment_charge_id, payment_id]
      );

      // Обновление статуса заказа
      await query(
        `UPDATE orders SET 
         status = 'completed',
         telegram_payment_charge_id = ?,
         updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [telegram_payment_charge_id, order_id]
      );

      // Отправка уведомления пользователю
      const order = await queryOne(`
        SELECT o.*, u.telegram_id, u.first_name
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        WHERE o.id = ?
      `, [order_id]);

      if (order) {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            chat_id: order.telegram_id,
            text: `🎉 Заказ #${order_id} успешно оплачен!\n\nСумма: ${total_amount} ${currency}\n\nВаши цифровые товары будут доставлены в ближайшее время.`,
            parse_mode: 'HTML'
          }
        );
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Получение статуса платежа
router.get('/status/:payment_id', authenticateToken, async (req, res) => {
  try {
    const { payment_id } = req.params;

    const payment = await queryOne(`
      SELECT p.*, o.user_id, o.status as order_status
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.id = ? AND o.user_id = ?
    `, [payment_id, req.user.id]);

    if (!payment) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Ошибка получения статуса платежа:', error);
    res.status(500).json({ error: 'Ошибка получения статуса платежа' });
  }
});

// Получение истории платежей пользователя
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Получение общего количества платежей
    const countResult = await query(`
      SELECT COUNT(*) as total 
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE o.user_id = ?
    `, [req.user.id]);
    
    const total = countResult.rows ? countResult.rows[0].total : countResult[0].total;

    // Получение платежей с пагинацией
    const payments = await query(`
      SELECT p.*, o.total_amount as order_amount, o.status as order_status
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE o.user_id = ?
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `, [req.user.id, limit, offset]);

    res.json({
      payments: payments.rows || payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения истории платежей:', error);
    res.status(500).json({ error: 'Ошибка получения истории платежей' });
  }
});

// Возврат средств
router.post('/refund/:payment_id', authenticateToken, async (req, res) => {
  try {
    const { payment_id } = req.params;
    const { reason } = req.body;

    // Проверка существования платежа
    const payment = await queryOne(`
      SELECT p.*, o.user_id, o.status as order_status
      FROM payments p
      LEFT JOIN orders o ON p.order_id = o.id
      WHERE p.id = ? AND o.user_id = ?
    `, [payment_id, req.user.id]);

    if (!payment) {
      return res.status(404).json({ error: 'Платеж не найден' });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({ error: 'Платеж не может быть возвращен' });
    }

    // Запрос на возврат через Telegram Bot API
    const refundResponse = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/refundStripePayment`,
      {
        telegram_payment_charge_id: payment.telegram_payment_charge_id
      }
    );

    if (refundResponse.data.ok) {
      // Обновление статуса платежа
      await query(
        'UPDATE payments SET status = ? WHERE id = ?',
        ['refunded', payment_id]
      );

      // Обновление статуса заказа
      await query(
        'UPDATE orders SET status = ? WHERE id = ?',
        ['refunded', payment.order_id]
      );

      res.json({ 
        success: true, 
        message: 'Возврат средств выполнен успешно' 
      });
    } else {
      throw new Error('Ошибка возврата средств через Telegram');
    }

  } catch (error) {
    console.error('Ошибка возврата средств:', error);
    res.status(500).json({ error: 'Ошибка возврата средств' });
  }
});

module.exports = router;
