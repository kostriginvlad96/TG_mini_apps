const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const createTables = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Создание таблицы categories
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Ошибка создания таблицы categories:', err.message);
          reject(err);
        } else {
          console.log('✅ Таблица categories создана');
        }
      });

      // Создание таблицы products
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          image_url TEXT,
          category_id INTEGER,
          stock INTEGER DEFAULT 0,
          is_active INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Ошибка создания таблицы products:', err.message);
          reject(err);
        } else {
          console.log('✅ Таблица products создана');
        }
      });

      // Создание таблицы users
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          telegram_id INTEGER UNIQUE NOT NULL,
          username TEXT,
          first_name TEXT,
          last_name TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('❌ Ошибка создания таблицы users:', err.message);
          reject(err);
        } else {
          console.log('✅ Таблица users создана');
        }
      });

      // Создание таблицы orders
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          telegram_payment_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Ошибка создания таблицы orders:', err.message);
          reject(err);
        } else {
          console.log('✅ Таблица orders создана');
        }
      });

      // Создание таблицы order_items
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `, (err) => {
        if (err) {
          console.error('❌ Ошибка создания таблицы order_items:', err.message);
          reject(err);
        } else {
          console.log('✅ Таблица order_items создана');
          resolve();
        }
      });
    });
  });
};

createTables()
  .then(() => {
    console.log('✅ Все таблицы созданы успешно');
    db.close();
  })
  .catch((err) => {
    console.error('💥 Ошибка создания таблиц:', err);
    db.close();
    process.exit(1);
  });
