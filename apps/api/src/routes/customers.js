const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

const router = express.Router();

// GET /api/customers?email=user@example.com - Look up customer by email
router.get('/', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        error: {
          code: 'MISSING_EMAIL',
          message: 'Email parameter is required'
        }
      });
    }
    
    const db = getDB();
    const customer = await db.collection('customers').findOne({ email });
    
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'No customer found with the provided email'
        }
      });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Customer lookup error:', error);
    res.status(500).json({
      error: {
        code: 'LOOKUP_ERROR',
        message: 'Failed to look up customer'
      }
    });
  }
});

// GET /api/customers/:id - Get customer profile by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ID',
          message: 'Invalid customer ID format'
        }
      });
    }
    
    const db = getDB();
    const customer = await db.collection('customers').findOne({ 
      _id: new ObjectId(id) 
    });
    
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found'
        }
      });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Customer fetch error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch customer'
      }
    });
  }
});

// POST /api/customers - Create new customer (for testing)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name and email are required'
        }
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_EMAIL',
          message: 'Invalid email format'
        }
      });
    }
    
    const db = getDB();
    
    // Check if email already exists
    const existing = await db.collection('customers').findOne({ email });
    if (existing) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'A customer with this email already exists'
        }
      });
    }
    
    const newCustomer = {
      name,
      email,
      phone: phone || '',
      address: address || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('customers').insertOne(newCustomer);
    
    res.status(201).json({
      ...newCustomer,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Customer creation error:', error);
    res.status(500).json({
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create customer'
      }
    });
  }
});

module.exports = router;
