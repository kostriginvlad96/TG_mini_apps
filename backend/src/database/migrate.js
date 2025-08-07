const { db } = require('./connection');

const createTables = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // PostgreSQL миграции
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          telegram_id BIGINT UNIQUE NOT NULL,
          username VARCHAR(255),
          first_name VARCHAR(255),
          last_name VARCHAR(255),
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS categories (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          description TEXT,
          image_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS products (
          id SERIAL PRIMARY KEY,
          category_id INTEGER REFERENCES categories(id),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          image_url TEXT,
          stock_quantity INTEGER DEFAULT 0,
          is_digital BOOLEAN DEFAULT true,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS orders (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          telegram_payment_charge_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS order_items (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id),
          product_id INTEGER REFERENCES products(id),
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS payments (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES orders(id),
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'RUB',
          status VARCHAR(50) DEFAULT 'pending',
          telegram_payment_charge_id VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS user_favorites (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          product_id INTEGER REFERENCES products(id),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id)
        );
      `);

    } else {
      // SQLite миграции
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id INTEGER UNIQUE NOT NULL,
            username TEXT,
            first_name TEXT,
            last_name TEXT,
            photo_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            description TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            original_price REAL,
            image_url TEXT,
            stock_quantity INTEGER DEFAULT 0,
            is_digital INTEGER DEFAULT 1,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            total_amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            payment_method TEXT,
            telegram_payment_charge_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            product_id INTEGER,
            quantity INTEGER NOT NULL,
            price REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            amount REAL NOT NULL,
            currency TEXT DEFAULT 'RUB',
            status TEXT DEFAULT 'pending',
            telegram_payment_charge_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (order_id) REFERENCES orders (id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS user_favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            product_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, product_id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (product_id) REFERENCES products (id)
          )
        `);
      });
    }

    console.log('✅ Таблицы базы данных созданы успешно');
  } catch (error) {
    console.error('❌ Ошибка создания таблиц:', error);
    throw error;
  }
};

// Запуск миграций
if (require.main === module) {
  createTables()
    .then(() => {
      console.log('🎉 Миграции завершены успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка миграций:', error);
      process.exit(1);
    });
}

module.exports = { createTables };
