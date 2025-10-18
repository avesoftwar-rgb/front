const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();

// GET /api/products - List products with filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      tag,
      category,
      sort = 'name',
      page = 1,
      limit = 10
    } = req.query;
    
    const db = getDB();
    const query = {};
    
    // Build search query
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Sorting options
    const sortOptions = {
      name: { name: 1 },
      price: { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 }
    };
    
    const sortBy = sortOptions[sort] || { name: 1 };
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const pageLimit = Math.min(parseInt(limit) || 10, 100); // Max 100 items
    const skip = (pageNum - 1) * pageLimit;
    
    // Execute query
    const [products, totalCount] = await Promise.all([
      db.collection('products')
        .find(query)
        .sort(sortBy)
        .skip(skip)
        .limit(pageLimit)
        .toArray(),
      db.collection('products').countDocuments(query)
    ]);
    
    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    });
  } catch (error) {
    console.error('Products list error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to retrieve products'
      }
    });
  }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Invalid product ID format'
        }
      });
    }
    
    const db = getDB();
    const product = await db.collection('products').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!product) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Product fetch error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch product'
      }
    });
  }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      tags,
      imageUrl,
      stock
    } = req.body;
    
    // Validation
    if (!name || !price || !category) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, price, and category are required'
        }
      });
    }
    
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PRICE',
          message: 'Price must be a positive number'
        }
      });
    }
    
    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STOCK',
          message: 'Stock must be a non-negative number'
        }
      });
    }
    
    const db = getDB();
    
    const newProduct = {
      name,
      description: description || '',
      price,
      category,
      tags: tags || [],
      imageUrl: imageUrl || '',
      stock: stock || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(newProduct);
    
    res.status(201).json({
      ...newProduct,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create product'
      }
    });
  }
});

// PUT /api/products/:id/stock - Update product stock
router.put('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, operation = 'set' } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Invalid product ID format'
        }
      });
    }
    
    if (typeof stock !== 'number') {
      return res.status(400).json({
        error: {
          code: 'INVALID_STOCK',
          message: 'Stock must be a number'
        }
      });
    }
    
    const db = getDB();
    let update;
    
    if (operation === 'increment') {
      update = { $inc: { stock } };
    } else if (operation === 'decrement') {
      update = { $inc: { stock: -stock } };
    } else {
      update = { $set: { stock } };
    }
    
    update.$set = { ...update.$set, updatedAt: new Date() };
    
    const result = await db.collection('products').findOneAndUpdate(
      { _id: new ObjectId(id) },
      update,
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found'
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Stock update error:', error);
    res.status(500).json({
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update stock'
      }
    });
  }
});

module.exports = router;
