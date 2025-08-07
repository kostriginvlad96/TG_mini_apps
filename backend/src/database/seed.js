const { query, queryOne } = require('./connection');

const seedData = async () => {
  try {
    // Создание категорий
    const categories = [
      {
        name: 'PS Plus',
        slug: 'ps-plus',
        description: 'Подписки PlayStation Plus',
        image_url: '/images/categories/ps-plus.png'
      },
      {
        name: 'EA Play',
        slug: 'ea-play',
        description: 'Подписки EA Play',
        image_url: '/images/categories/ea-play.png'
      },
      {
        name: 'Игровой донат',
        slug: 'game-donations',
        description: 'Игровые валюты и донат',
        image_url: '/images/categories/donations.png'
      },
      {
        name: 'Игры',
        slug: 'games',
        description: 'Цифровые игры',
        image_url: '/images/categories/games.png'
      }
    ];

    for (const category of categories) {
      await query(
        'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
        [category.name, category.slug, category.description, category.image_url]
      );
    }

    // Получение ID категорий
    const psPlusCategory = await queryOne('SELECT id FROM categories WHERE slug = ?', ['ps-plus']);
    const eaPlayCategory = await queryOne('SELECT id FROM categories WHERE slug = ?', ['ea-play']);
    const donationsCategory = await queryOne('SELECT id FROM categories WHERE slug = ?', ['game-donations']);
    const gamesCategory = await queryOne('SELECT id FROM categories WHERE slug = ?', ['games']);

    // Создание товаров
    const products = [
      // PS Plus подписки
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Essential 1 месяц',
        description: 'Подписка PlayStation Plus Essential на 1 месяц. Доступ к онлайн-играм, ежемесячным играм и эксклюзивным скидкам.',
        price: 399.00,
        original_price: 499.00,
        image_url: '/images/products/ps-plus-essential-1m.png',
        stock_quantity: 100
      },
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Essential 12 месяцев',
        description: 'Подписка PlayStation Plus Essential на 12 месяцев. Экономия 20% при покупке на год.',
        price: 3999.00,
        original_price: 5988.00,
        image_url: '/images/products/ps-plus-essential-12m.png',
        stock_quantity: 50
      },
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Extra 1 месяц',
        description: 'Подписка PlayStation Plus Extra на 1 месяц. Все возможности Essential + каталог игр.',
        price: 599.00,
        original_price: 699.00,
        image_url: '/images/products/ps-plus-extra-1m.png',
        stock_quantity: 75
      },
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Extra 12 месяцев',
        description: 'Подписка PlayStation Plus Extra на 12 месяцев. Экономия 15% при покупке на год.',
        price: 5999.00,
        original_price: 8388.00,
        image_url: '/images/products/ps-plus-extra-12m.png',
        stock_quantity: 30
      },
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Deluxe 1 месяц',
        description: 'Подписка PlayStation Plus Deluxe на 1 месяц. Все возможности Extra + классические игры.',
        price: 799.00,
        original_price: 899.00,
        image_url: '/images/products/ps-plus-deluxe-1m.png',
        stock_quantity: 60
      },
      {
        category_id: psPlusCategory.id,
        name: 'PS Plus Deluxe 12 месяцев',
        description: 'Подписка PlayStation Plus Deluxe на 12 месяцев. Экономия 10% при покупке на год.',
        price: 7999.00,
        original_price: 10788.00,
        image_url: '/images/products/ps-plus-deluxe-12m.png',
        stock_quantity: 25
      },

      // EA Play подписки
      {
        category_id: eaPlayCategory.id,
        name: 'EA Play 1 месяц',
        description: 'Подписка EA Play на 1 месяц. Доступ к библиотеке игр EA и эксклюзивным скидкам.',
        price: 299.00,
        original_price: 399.00,
        image_url: '/images/products/ea-play-1m.png',
        stock_quantity: 80
      },
      {
        category_id: eaPlayCategory.id,
        name: 'EA Play 12 месяцев',
        description: 'Подписка EA Play на 12 месяцев. Экономия 25% при покупке на год.',
        price: 2999.00,
        original_price: 4788.00,
        image_url: '/images/products/ea-play-12m.png',
        stock_quantity: 40
      },

      // Игровой донат
      {
        category_id: donationsCategory.id,
        name: 'EA FC25 Points 1000',
        description: '1000 монет для EA FC25. Используйте для покупки игроков и открытия паков.',
        price: 199.00,
        original_price: 249.00,
        image_url: '/images/products/ea-fc25-points-1000.png',
        stock_quantity: 200
      },
      {
        category_id: donationsCategory.id,
        name: 'EA FC25 Points 2200',
        description: '2200 монет для EA FC25. Лучшая цена за большее количество монет.',
        price: 399.00,
        original_price: 549.00,
        image_url: '/images/products/ea-fc25-points-2200.png',
        stock_quantity: 150
      },
      {
        category_id: donationsCategory.id,
        name: 'EA FC25 Points 4600',
        description: '4600 монет для EA FC25. Максимальная экономия при покупке большого количества.',
        price: 799.00,
        original_price: 1149.00,
        image_url: '/images/products/ea-fc25-points-4600.png',
        stock_quantity: 100
      },

      // Игры
      {
        category_id: gamesCategory.id,
        name: 'God of War Ragnarök',
        description: 'Эпическое приключение Кратоса и Атрея в мире скандинавских мифов.',
        price: 3999.00,
        original_price: 4999.00,
        image_url: '/images/products/god-of-war-ragnarok.png',
        stock_quantity: 25
      },
      {
        category_id: gamesCategory.id,
        name: 'Spider-Man 2',
        description: 'Продолжение истории Питера Паркера и Майлза Моралеса в Нью-Йорке.',
        price: 4499.00,
        original_price: 5499.00,
        image_url: '/images/products/spider-man-2.png',
        stock_quantity: 30
      },
      {
        category_id: gamesCategory.id,
        name: 'The Last of Us Part I',
        description: 'Ремейк культовой игры о выживании в постапокалиптическом мире.',
        price: 3499.00,
        original_price: 4499.00,
        image_url: '/images/products/last-of-us-part-1.png',
        stock_quantity: 20
      }
    ];

    for (const product of products) {
      await query(
        `INSERT INTO products (category_id, name, description, price, original_price, image_url, stock_quantity) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [product.category_id, product.name, product.description, product.price, product.original_price, product.image_url, product.stock_quantity]
      );
    }

    console.log('✅ Тестовые данные добавлены успешно');
  } catch (error) {
    console.error('❌ Ошибка добавления тестовых данных:', error);
    throw error;
  }
};

// Запуск заполнения данных
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('🎉 База данных заполнена тестовыми данными');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка заполнения данных:', error);
      process.exit(1);
    });
}

module.exports = { seedData };
