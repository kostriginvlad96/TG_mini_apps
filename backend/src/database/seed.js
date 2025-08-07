const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

const seedData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Добавление категорий
      const categories = [
        {
          name: 'PS Plus',
          slug: 'ps-plus',
          description: 'Подписки PlayStation Plus',
          image_url: '/images/categories/ps-plus.png'
        },
        {
          name: 'Xbox Game Pass',
          slug: 'xbox-game-pass',
          description: 'Подписки Xbox Game Pass',
          image_url: '/images/categories/xbox-game-pass.png'
        },
        {
          name: 'Steam',
          slug: 'steam',
          description: 'Игры в Steam',
          image_url: '/images/categories/steam.png'
        },
        {
          name: 'Nintendo',
          slug: 'nintendo',
          description: 'Игры для Nintendo Switch',
          image_url: '/images/categories/nintendo.png'
        },
        {
          name: 'Epic Games',
          slug: 'epic-games',
          description: 'Игры в Epic Games Store',
          image_url: '/images/categories/epic-games.png'
        }
      ];

      // Очистка таблицы categories
      db.run('DELETE FROM categories', (err) => {
        if (err) {
          console.error('❌ Ошибка очистки таблицы categories:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Таблица categories очищена');
      });

      // Добавление категорий
      const insertCategory = db.prepare('INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)');
      
      categories.forEach((category, index) => {
        insertCategory.run([category.name, category.slug, category.description, category.image_url], (err) => {
          if (err) {
            console.error('❌ Ошибка добавления категории:', err.message);
            reject(err);
            return;
          }
          console.log(`✅ Категория "${category.name}" добавлена`);
          
          if (index === categories.length - 1) {
            insertCategory.finalize();
          }
        });
      });

      // Добавление продуктов
      const products = [
        {
          name: 'PS Plus Essential 12 месяцев',
          slug: 'ps-plus-essential-12m',
          description: 'Подписка PlayStation Plus Essential на 12 месяцев',
          price: 3999.00,
          original_price: 4999.00,
          image_url: '/images/products/ps-plus-essential-12m.png',
          category_id: 1,
          stock: 100
        },
        {
          name: 'PS Plus Extra 12 месяцев',
          slug: 'ps-plus-extra-12m',
          description: 'Подписка PlayStation Plus Extra на 12 месяцев',
          price: 5999.00,
          original_price: 6999.00,
          image_url: '/images/products/ps-plus-extra-12m.png',
          category_id: 1,
          stock: 50
        },
        {
          name: 'Xbox Game Pass Ultimate 3 месяца',
          slug: 'xbox-game-pass-ultimate-3m',
          description: 'Подписка Xbox Game Pass Ultimate на 3 месяца',
          price: 1499.00,
          original_price: 1999.00,
          image_url: '/images/products/xbox-game-pass-ultimate-3m.png',
          category_id: 2,
          stock: 75
        },
        {
          name: 'Steam Gift Card 1000₽',
          slug: 'steam-gift-card-1000',
          description: 'Подарочная карта Steam на 1000 рублей',
          price: 1000.00,
          original_price: 1000.00,
          image_url: '/images/products/steam-gift-card-1000.png',
          category_id: 3,
          stock: 200
        },
        {
          name: 'Nintendo eShop Card 1000₽',
          slug: 'nintendo-eshop-card-1000',
          description: 'Карта Nintendo eShop на 1000 рублей',
          price: 1000.00,
          original_price: 1000.00,
          image_url: '/images/products/nintendo-eshop-card-1000.png',
          category_id: 4,
          stock: 150
        },
        {
          name: 'Epic Games Store Gift Card 500₽',
          slug: 'epic-games-store-gift-card-500',
          description: 'Подарочная карта Epic Games Store на 500 рублей',
          price: 500.00,
          original_price: 500.00,
          image_url: '/images/products/epic-games-store-gift-card-500.png',
          category_id: 5,
          stock: 100
        }
      ];

      // Очистка таблицы products
      db.run('DELETE FROM products', (err) => {
        if (err) {
          console.error('❌ Ошибка очистки таблицы products:', err.message);
          reject(err);
          return;
        }
        console.log('✅ Таблица products очищена');
      });

      // Добавление продуктов
      const insertProduct = db.prepare(`
        INSERT INTO products (name, slug, description, price, original_price, image_url, category_id, stock) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      products.forEach((product, index) => {
        insertProduct.run([
          product.name, 
          product.slug, 
          product.description, 
          product.price, 
          product.original_price, 
          product.image_url, 
          product.category_id, 
          product.stock
        ], (err) => {
          if (err) {
            console.error('❌ Ошибка добавления продукта:', err.message);
            reject(err);
            return;
          }
          console.log(`✅ Продукт "${product.name}" добавлен`);
          
          if (index === products.length - 1) {
            insertProduct.finalize();
            console.log('✅ Все тестовые данные добавлены успешно');
            resolve();
          }
        });
      });
    });
  });
};

seedData()
  .then(() => {
    console.log('🎉 База данных заполнена тестовыми данными');
    db.close();
  })
  .catch((err) => {
    console.error('💥 Ошибка заполнения данных:', err);
    db.close();
    process.exit(1);
  });
