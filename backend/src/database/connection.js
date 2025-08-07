const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

let db;

if (process.env.NODE_ENV === 'production') {
  // PostgreSQL для production
  db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });
} else {
  // SQLite для разработки
  const dbPath = path.join(__dirname, '../../database.sqlite');
  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Ошибка подключения к SQLite:', err.message);
    } else {
      console.log('✅ Подключение к SQLite установлено');
    }
  });
}

// Функция для выполнения запросов
const query = (text, params) => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      // PostgreSQL
      db.query(text, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    } else {
      // SQLite
      db.all(text, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve({ rows });
        }
      });
    }
  });
};

// Функция для выполнения одной строки
const queryOne = (text, params) => {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'production') {
      // PostgreSQL
      db.query(text, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result.rows[0]);
        }
      });
    } else {
      // SQLite
      db.get(text, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    }
  });
};

module.exports = {
  db,
  query,
  queryOne
};
