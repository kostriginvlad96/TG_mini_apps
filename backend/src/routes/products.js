const express = require('express');
const { query, queryOne } = require('../database/connection');

const router = express.Router();

// Получение всех категорий
router.get('/categories', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: categories.rows || categories });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

// Получение товаров с фильтрацией
router.get('/', async (req, res) => {
  try {
    const { 
      category_id, 
      search, 
      page = 1, 
      limit = 20,
      sort = 'name',
      order = 'ASC'
    } = req.query;

    let whereConditions = ['is_active = 1'];
    let params = [];
    let paramIndex = 1;

    // Фильтр по категории
    if (category_id) {
      whereConditions.push(`category_id = $${paramIndex}`);
      params.push(category_id);
      paramIndex++;
    }

    // Поиск по названию
    if (search) {
      whereConditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    // Получение общего количества товаров
    const countQuery = `SELECT COUNT(*) as total FROM products WHERE ${whereClause}`;
    const countResult = await query(countQuery, params);
    const total = countResult.rows ? countResult.rows[0].total : countResult[0].total;

    // Получение товаров с пагинацией
    const productsQuery = `
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE ${whereClause}
      ORDER BY p.${sort} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    params.push(limit, offset);
    const products = await query(productsQuery, params);

    res.json({
      products: products.rows || products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения товаров:', error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
});

// Получение товара по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await queryOne(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.id = ? AND p.is_active = 1
    `, [id]);

    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json({ product });
  } catch (error) {
    console.error('Ошибка получения товара:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
});

// Получение популярных товаров
router.get('/featured/popular', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const products = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1
      ORDER BY p.original_price - p.price DESC
      LIMIT ?
    `, [limit]);

    res.json({ products: products.rows || products });
  } catch (error) {
    console.error('Ошибка получения популярных товаров:', error);
    res.status(500).json({ error: 'Ошибка получения популярных товаров' });
  }
});

// Получение товаров со скидками
router.get('/featured/discounts', async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const products = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug,
             ROUND(((p.original_price - p.price) / p.original_price * 100), 0) as discount_percent
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.is_active = 1 AND p.original_price > p.price
      ORDER BY discount_percent DESC
      LIMIT ?
    `, [limit]);

    res.json({ products: products.rows || products });
  } catch (error) {
    console.error('Ошибка получения товаров со скидками:', error);
    res.status(500).json({ error: 'Ошибка получения товаров со скидками' });
  }
});

// Поиск товаров
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    const suggestions = await query(`
      SELECT DISTINCT name, category_id 
      FROM products 
      WHERE is_active = 1 AND name ILIKE ?
      LIMIT 10
    `, [`%${q}%`]);

    res.json({ suggestions: suggestions.rows || suggestions });
  } catch (error) {
    console.error('Ошибка поиска товаров:', error);
    res.status(500).json({ error: 'Ошибка поиска товаров' });
  }
});

// Получение товаров по категории
router.get('/category/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, sort = 'name', order = 'ASC' } = req.query;

    // Получение категории
    const category = await queryOne('SELECT * FROM categories WHERE slug = ?', [slug]);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    const offset = (page - 1) * limit;

    // Получение общего количества товаров в категории
    const countResult = await query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = 1',
      [category.id]
    );
    const total = countResult.rows ? countResult.rows[0].total : countResult[0].total;

    // Получение товаров категории
    const products = await query(`
      SELECT p.*, c.name as category_name, c.slug as category_slug 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      WHERE p.category_id = ? AND p.is_active = 1
      ORDER BY p.${sort} ${order}
      LIMIT ? OFFSET ?
    `, [category.id, limit, offset]);

    res.json({
      category,
      products: products.rows || products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Ошибка получения товаров категории:', error);
    res.status(500).json({ error: 'Ошибка получения товаров категории' });
  }
});

module.exports = router;
