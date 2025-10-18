const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();

// Order status enum
const ORDER_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
  try {
    const { customerId, items } = req.body;
    
    // Validation
    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'CustomerId and items array are required'
        }
      });
    }
    
    if (!ObjectId.isValid(customerId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CUSTOMER_ID',
          message: 'Invalid customer ID format'
        }
      });
    }
    
    const db = getDB();
    
    // Verify customer exists
    const customer = await db.collection('customers').findOne({ 
      _id: new ObjectId(customerId) 
    });
    
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      });
    }
    
    // Validate and enrich items with product info
    const enrichedItems = [];
    let total = 0;
    
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json({
          error: {
            code: 'INVALID_ITEM',
            message: 'Each item must have productId and quantity'
          }
        });
      }
      
      if (typeof item.quantity !== 'number' || item.quantity <= 0) {
        return res.status(400).json({
          error: {
            code: 'INVALID_QUANTITY',
            message: 'Quantity must be a positive number'
          }
        });
      }
      
      if (!ObjectId.isValid(item.productId)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_PRODUCT_ID',
            message: `Invalid product ID: ${item.productId}`
          }
        });
      }
      
      const product = await db.collection('products').findOne({ 
        _id: new ObjectId(item.productId) 
      });
      
      if (!product) {
        return res.status(404).json({
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: `Product not found: ${item.productId}`
          }
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({
          error: {
            code: 'INSUFFICIENT_STOCK',
            message: `Insufficient stock for product: ${product.name}`
          }
        });
      }
      
      const itemTotal = product.price * item.quantity;
      total += itemTotal;
      
      enrichedItems.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        subtotal: itemTotal
      });
      
      // Update product stock
      await db.collection('products').updateOne(
        { _id: new ObjectId(item.productId) },
        { 
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() }
        }
      );
    }
    
    // Generate estimated delivery date (3-7 days from now)
    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + Math.floor(Math.random() * 5) + 3);
    
    const newOrder = {
      customerId,
      customerEmail: customer.email,
      customerName: customer.name,
      items: enrichedItems,
      total: Math.round(total * 100) / 100, // Round to 2 decimal places
      status: 'PENDING',
      carrier: 'Standard Shipping',
      estimatedDelivery,
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [{
        status: 'PENDING',
        timestamp: new Date()
      }]
    };
    
    const result = await db.collection('orders').insertOne(newOrder);
    
    res.status(201).json({
      ...newOrder,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create order'
      }
    });
  }
});

// GET /api/orders/:id - Get single order
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Invalid order ID format'
        }
      });
    }
    
    const db = getDB();
    const order = await db.collection('orders').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!order) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Order fetch error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch order'
      }
    });
  }
});

// GET /api/orders?customerId=:customerId - Get orders for specific customer
router.get('/', async (req, res) => {
  try {
    const { customerId, status, page = 1, limit = 10 } = req.query;
    
    if (!customerId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_CUSTOMER_ID',
          message: 'CustomerId parameter is required'
        }
      });
    }
    
    if (!ObjectId.isValid(customerId)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CUSTOMER_ID',
          message: 'Invalid customer ID format'
        }
      });
    }
    
    const db = getDB();
    const query = { customerId };
    
    if (status) {
      if (!ORDER_STATUSES.includes(status)) {
        return res.status(400).json({
          error: {
            code: 'INVALID_STATUS',
            message: `Invalid status. Must be one of: ${ORDER_STATUSES.join(', ')}`
          }
        });
      }
      query.status = status;
    }
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const pageLimit = Math.min(parseInt(limit) || 10, 100);
    const skip = (pageNum - 1) * pageLimit;
    
    const [orders, totalCount] = await Promise.all([
      db.collection('orders')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit)
        .toArray(),
      db.collection('orders').countDocuments(query)
    ]);
    
    res.json({
      orders,
      pagination: {
        page: pageNum,
        limit: pageLimit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / pageLimit)
      }
    });
  } catch (error) {
    console.error('Orders list error:', error);
    res.status(500).json({
      error: {
        code: 'LIST_ERROR',
        message: 'Failed to retrieve orders'
      }
    });
  }
});

// PUT /api/orders/:id/status - Update order status (for testing)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Invalid order ID format'
        }
      });
    }
    
    if (!status || !ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_STATUS',
          message: `Status must be one of: ${ORDER_STATUSES.join(', ')}`
        }
      });
    }
    
    const db = getDB();
    
    const result = await db.collection('orders').findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status, 
          updatedAt: new Date() 
        },
        $push: {
          statusHistory: {
            status,
            timestamp: new Date()
          }
        }
      },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return res.status(404).json({
        error: {
          code: 'ORDER_NOT_FOUND',
          message: 'Order not found'
        }
      });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update order status'
      }
    });
  }
});

module.exports = router;
