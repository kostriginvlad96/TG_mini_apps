const express = require('express');
const axios = require('axios');
const { query, queryOne } = require('../database/connection');

const router = express.Router();

// Получение информации о боте
router.get('/bot-info', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`
    );

    if (response.data.ok) {
      res.json({ bot: response.data.result });
    } else {
      throw new Error('Ошибка получения информации о боте');
    }
  } catch (error) {
    console.error('Ошибка получения информации о боте:', error);
    res.status(500).json({ error: 'Ошибка получения информации о боте' });
  }
});

// Отправка сообщения пользователю
router.post('/send-message', async (req, res) => {
  try {
    const { chat_id, text, parse_mode = 'HTML' } = req.body;

    if (!chat_id || !text) {
      return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id,
        text,
        parse_mode
      }
    );

    if (response.data.ok) {
      res.json({ success: true, message: response.data.result });
    } else {
      throw new Error('Ошибка отправки сообщения');
    }
  } catch (error) {
    console.error('Ошибка отправки сообщения:', error);
    res.status(500).json({ error: 'Ошибка отправки сообщения' });
  }
});

// Отправка уведомления о заказе
router.post('/order-notification', async (req, res) => {
  try {
    const { order_id, user_id } = req.body;

    // Получение информации о заказе
    const order = await queryOne(`
      SELECT o.*, u.telegram_id, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [order_id, user_id]);

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Получение товаров заказа
    const orderItems = await query(`
      SELECT oi.*, p.name, p.image_url
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [order_id]);

    // Формирование сообщения
    const itemsList = (orderItems.rows || orderItems)
      .map(item => `• ${item.name} - ${item.quantity} шт.`)
      .join('\n');

    const message = `
🎉 Заказ #${order.id} успешно создан!

📦 Товары:
${itemsList}

💰 Сумма: ${order.total_amount} ₽
📅 Дата: ${new Date(order.created_at).toLocaleDateString('ru-RU')}

Ваши цифровые товары будут доставлены в ближайшее время.
    `.trim();

    // Отправка сообщения
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: order.telegram_id,
        text: message,
        parse_mode: 'HTML'
      }
    );

    if (response.data.ok) {
      res.json({ success: true, message: 'Уведомление отправлено' });
    } else {
      throw new Error('Ошибка отправки уведомления');
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления о заказе:', error);
    res.status(500).json({ error: 'Ошибка отправки уведомления' });
  }
});

// Отправка уведомления о доставке
router.post('/delivery-notification', async (req, res) => {
  try {
    const { order_id, user_id, delivery_data } = req.body;

    // Получение информации о заказе
    const order = await queryOne(`
      SELECT o.*, u.telegram_id, u.first_name, u.last_name
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ? AND o.user_id = ?
    `, [order_id, user_id]);

    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Формирование сообщения о доставке
    const message = `
🎁 Заказ #${order.id} доставлен!

📦 Ваши цифровые товары готовы к использованию.

${delivery_data ? `📋 Данные для активации:\n${delivery_data}` : ''}

Спасибо за покупку! 🛒
    `.trim();

    // Отправка сообщения
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        chat_id: order.telegram_id,
        text: message,
        parse_mode: 'HTML'
      }
    );

    if (response.data.ok) {
      res.json({ success: true, message: 'Уведомление о доставке отправлено' });
    } else {
      throw new Error('Ошибка отправки уведомления о доставке');
    }
  } catch (error) {
    console.error('Ошибка отправки уведомления о доставке:', error);
    res.status(500).json({ error: 'Ошибка отправки уведомления о доставке' });
  }
});

// Получение статистики бота
router.get('/bot-stats', async (req, res) => {
  try {
    // Получение статистики из базы данных
    const userStats = await queryOne(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN created_at >= DATE('now', '-7 days') THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= DATE('now', '-30 days') THEN 1 END) as new_users_month
      FROM users
    `);

    const orderStats = await queryOne(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN created_at >= DATE('now', '-7 days') THEN 1 END) as orders_week
      FROM orders
    `);

    const productStats = await queryOne(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN stock_quantity > 0 THEN 1 END) as available_products
      FROM products
    `);

    res.json({
      users: userStats,
      orders: orderStats,
      products: productStats
    });
  } catch (error) {
    console.error('Ошибка получения статистики бота:', error);
    res.status(500).json({ error: 'Ошибка получения статистики бота' });
  }
});

// Webhook для получения обновлений от Telegram
router.post('/webhook', async (req, res) => {
  try {
    const { message, callback_query, pre_checkout_query, successful_payment } = req.body;

    // Обработка сообщений
    if (message) {
      const { chat, text, from } = message;

      // Обработка команды /start
      if (text === '/start') {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            chat_id: chat.id,
            text: `👋 Привет! Добро пожаловать в магазин "БАБКИН ВНУК"!\n\nЗдесь вы можете купить цифровые товары: игры, подписки и многое другое.\n\nДля начала покупок перейдите в наш мини-приложение.`,
            parse_mode: 'HTML'
          }
        );
      }

      // Обработка команды /help
      if (text === '/help') {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            chat_id: chat.id,
            text: `❓ Помощь по использованию бота:\n\n/start - Начать работу с ботом\n/help - Показать эту справку\n/orders - История заказов\n/support - Обратиться в поддержку`,
            parse_mode: 'HTML'
          }
        );
      }

      // Обработка команды /orders
      if (text === '/orders') {
        const user = await queryOne(
          'SELECT * FROM users WHERE telegram_id = ?',
          [from.id]
        );

        if (user) {
          const orders = await query(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
          `, [user.id]);

          if (orders.rows && orders.rows.length > 0) {
            const ordersList = orders.rows
              .map(order => `• Заказ #${order.id} - ${order.total_amount} ₽ (${order.status})`)
              .join('\n');

            await axios.post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: chat.id,
                text: `📋 Ваши последние заказы:\n\n${ordersList}\n\nДля просмотра всех заказов перейдите в мини-приложение.`,
                parse_mode: 'HTML'
              }
            );
          } else {
            await axios.post(
              `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
              {
                chat_id: chat.id,
                text: `📋 У вас пока нет заказов.\n\nСделайте первую покупку в нашем мини-приложении!`,
                parse_mode: 'HTML'
              }
            );
          }
        }
      }

      // Обработка команды /support
      if (text === '/support') {
        await axios.post(
          `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
          {
            chat_id: chat.id,
            text: `🆘 Поддержка:\n\nЕсли у вас возникли вопросы или проблемы, обратитесь в поддержку через мини-приложение или напишите нам на @babkin_vnuk_support`,
            parse_mode: 'HTML'
          }
        );
      }
    }

    // Обработка успешных платежей
    if (successful_payment) {
      // Логика обработки платежей уже реализована в payments.js
      console.log('Получен успешный платеж:', successful_payment);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Ошибка обработки webhook:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
});

// Установка webhook
router.post('/set-webhook', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL webhook не предоставлен' });
    }

    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        url: `${url}/api/telegram/webhook`
      }
    );

    if (response.data.ok) {
      res.json({ success: true, message: 'Webhook установлен успешно' });
    } else {
      throw new Error('Ошибка установки webhook');
    }
  } catch (error) {
    console.error('Ошибка установки webhook:', error);
    res.status(500).json({ error: 'Ошибка установки webhook' });
  }
});

// Удаление webhook
router.post('/delete-webhook', async (req, res) => {
  try {
    const response = await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/deleteWebhook`
    );

    if (response.data.ok) {
      res.json({ success: true, message: 'Webhook удален успешно' });
    } else {
      throw new Error('Ошибка удаления webhook');
    }
  } catch (error) {
    console.error('Ошибка удаления webhook:', error);
    res.status(500).json({ error: 'Ошибка удаления webhook' });
  }
});

module.exports = router;
