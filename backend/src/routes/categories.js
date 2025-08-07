const express = require('express');
const { query, queryOne } = require('../database/connection');

const router = express.Router();

// Получение всех категорий
router.get('/', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: categories.rows || categories });
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
});

// Получение категории по ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Ошибка получения категории:', error);
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
});

// Получение категории по slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const category = await queryOne('SELECT * FROM categories WHERE slug = ?', [slug]);

    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json({ category });
  } catch (error) {
    console.error('Ошибка получения категории:', error);
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
});

// Получение товаров категории
router.get('/:id/products', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'name', order = 'ASC' } = req.query;

    // Проверка существования категории
    const category = await queryOne('SELECT * FROM categories WHERE id = ?', [id]);
    
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    const offset = (page - 1) * limit;

    // Получение общего количества товаров в категории
    const countResult = await query(
      'SELECT COUNT(*) as total FROM products WHERE category_id = ? AND is_active = 1',
      [id]
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
    `, [id, limit, offset]);

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

