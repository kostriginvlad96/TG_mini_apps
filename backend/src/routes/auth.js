const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
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

// Валидация данных от Telegram
const validateTelegramData = (data) => {
  const { hash, ...userData } = data;
  
  if (!hash) {
    throw new Error('Хеш не предоставлен');
  }

  // Создание строки для проверки
  const dataCheckString = Object.keys(userData)
    .sort()
    .map(key => `${key}=${userData[key]}`)
    .join('\n');

  // Создание секретного ключа
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(process.env.TELEGRAM_BOT_TOKEN).digest();
  
  // Создание хеша для проверки
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  if (calculatedHash !== hash) {
    throw new Error('Недействительная подпись данных');
  }

  return userData;
};

// Регистрация/авторизация пользователя через Telegram
router.post('/telegram', async (req, res) => {
  try {
    const telegramData = req.body;
    
    // Валидация данных от Telegram
    const validatedData = validateTelegramData(telegramData);
    
    const {
      id: telegram_id,
      username,
      first_name,
      last_name,
      photo_url
    } = validatedData;

    // Поиск существующего пользователя
    let user = await queryOne(
      'SELECT * FROM users WHERE telegram_id = ?',
      [telegram_id]
    );

    if (!user) {
      // Создание нового пользователя
      const result = await query(
        `INSERT INTO users (telegram_id, username, first_name, last_name, photo_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [telegram_id, username, first_name, last_name, photo_url]
      );
      
      user = {
        id: result.insertId || result.lastID,
        telegram_id,
        username,
        first_name,
        last_name,
        photo_url
      };
    } else {
      // Обновление данных существующего пользователя
      await query(
        `UPDATE users SET username = ?, first_name = ?, last_name = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE telegram_id = ?`,
        [username, first_name, last_name, photo_url, telegram_id]
      );
    }

    // Создание JWT токена
    const token = jwt.sign(
      { 
        id: user.id, 
        telegram_id: user.telegram_id,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        photo_url: user.photo_url
      }
    });

  } catch (error) {
    console.error('Ошибка аутентификации:', error);
    res.status(400).json({ 
      error: 'Ошибка аутентификации',
      message: error.message 
    });
  }
});

// Получение профиля пользователя
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await queryOne(
      'SELECT id, telegram_id, username, first_name, last_name, photo_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка получения профиля' });
  }
});

// Обновление профиля пользователя
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, photo_url } = req.body;

    await query(
      `UPDATE users SET first_name = ?, last_name = ?, photo_url = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [first_name, last_name, photo_url, req.user.id]
    );

    res.json({ success: true, message: 'Профиль обновлен' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка обновления профиля' });
  }
});

// Проверка токена
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

module.exports = router;
