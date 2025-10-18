const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

/**
 * Function Registry System
 * Manages callable functions for the assistant
 */

class FunctionRegistry {
  constructor() {
    this.functions = new Map();
    this.registerBuiltInFunctions();
  }
  
  /**
   * Register a new function
   */
  register(name, schema, handler) {
    if (!name || !schema || !handler) {
      throw new Error('Name, schema, and handler are required');
    }
    
    this.functions.set(name, {
      schema,
      handler
    });
  }
  
  /**
   * Get all function schemas
   */
  getAllSchemas() {
    const schemas = [];
    for (const [name, func] of this.functions) {
      schemas.push({
        name,
        ...func.schema
      });
    }
    return schemas;
  }
  
  /**
   * Execute a function by name with parameters
   */
  async execute(name, parameters) {
    const func = this.functions.get(name);
    
    if (!func) {
      throw new Error(`Function '${name}' not found`);
    }
    
    try {
      // Validate required parameters
      const required = func.schema.required || [];
      for (const param of required) {
        if (!(param in parameters)) {
          throw new Error(`Missing required parameter: ${param}`);
        }
      }
      
      // Execute the function
      const result = await func.handler(parameters);
      
      return {
        success: true,
        result,
        function: name
      };
    } catch (error) {
      console.error(`Function execution error (${name}):`, error);
      return {
        success: false,
        error: error.message,
        function: name
      };
    }
  }
  
  /**
   * Register built-in functions
   */
  registerBuiltInFunctions() {
    // Get Order Status Function
    this.register(
      'getOrderStatus',
      {
        description: 'Get the current status of an order',
        parameters: {
          type: 'object',
          properties: {
            orderId: {
              type: 'string',
              description: 'The order ID to check'
            }
          }
        },
        required: ['orderId']
      },
      async (params) => {
        const { orderId } = params;
        
        if (!ObjectId.isValid(orderId)) {
          throw new Error('Invalid order ID format');
        }
        
        const db = getDB();
        const order = await db.collection('orders').findOne({
          _id: new ObjectId(orderId)
        });
        
        if (!order) {
          throw new Error('Order not found');
        }
        
        return {
          orderId: order._id.toString(),
          status: order.status,
          customerName: order.customerName,
          total: order.total,
          carrier: order.carrier,
          estimatedDelivery: order.estimatedDelivery,
          createdAt: order.createdAt,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))
        };
      }
    );
    
    // Search Products Function
    this.register(
      'searchProducts',
      {
        description: 'Search for products by query',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
              default: 5
            },
            category: {
              type: 'string',
              description: 'Filter by category (optional)'
            }
          }
        },
        required: ['query']
      },
      async (params) => {
        const { query, limit = 5, category } = params;
        
        const db = getDB();
        
        // Build search filter
        const filter = {};
        
        if (query) {
          // Simple text search on name and description
          filter.$or = [
            { name: { $regex: query, $options: 'i' } },
            { description: { $regex: query, $options: 'i' } }
          ];
        }
        
        if (category) {
          filter.category = category;
        }
        
        const products = await db.collection('products')
          .find(filter)
          .limit(Math.min(limit, 10))
          .toArray();
        
        return {
          count: products.length,
          products: products.map(p => ({
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            category: p.category,
            stock: p.stock,
            imageUrl: p.imageUrl
          }))
        };
      }
    );
    
    // Get Customer Orders Function
    this.register(
      'getCustomerOrders',
      {
        description: 'Get all orders for a customer by email',
        parameters: {
          type: 'object',
          properties: {
            email: {
              type: 'string',
              description: 'Customer email address'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of orders to return',
              default: 5
            }
          }
        },
        required: ['email']
      },
      async (params) => {
        const { email, limit = 5 } = params;
        
        const db = getDB();
        
        // First find the customer
        const customer = await db.collection('customers').findOne({ email });
        
        if (!customer) {
          throw new Error('Customer not found');
        }
        
        // Get customer's orders
        const orders = await db.collection('orders')
          .find({ customerId: customer._id.toString() })
          .sort({ createdAt: -1 })
          .limit(Math.min(limit, 10))
          .toArray();
        
        return {
          customer: {
            name: customer.name,
            email: customer.email
          },
          orderCount: orders.length,
          orders: orders.map(o => ({
            orderId: o._id.toString(),
            status: o.status,
            total: o.total,
            itemCount: o.items.length,
            createdAt: o.createdAt,
            estimatedDelivery: o.estimatedDelivery
          }))
        };
      }
    );
    
    // Get Store Policies Function (optional, for policy lookups)
    this.register(
      'getStorePolicy',
      {
        description: 'Get specific store policy information',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Policy category (e.g., returns, shipping, warranty)'
            }
          }
        },
        required: ['category']
      },
      async (params) => {
        const { category } = params;
        
        // This would typically query a policies collection
        // For now, return mock data
        const policies = {
          returns: {
            title: 'Return Policy',
            summary: 'Items can be returned within 30 days with receipt',
            details: 'All items must be in original condition with tags attached.'
          },
          shipping: {
            title: 'Shipping Policy',
            summary: 'Free shipping on orders over $50',
            details: 'Standard shipping: 5-7 days, Express: 2-3 days, Overnight available.'
          },
          warranty: {
            title: 'Warranty Policy',
            summary: '1 year warranty on all electronics',
            details: 'Covers manufacturing defects. Does not cover physical damage.'
          }
        };
        
        const policy = policies[category.toLowerCase()];
        
        if (!policy) {
          throw new Error(`Policy category '${category}' not found`);
        }
        
        return policy;
      }
    );
    
    // Check Product Availability Function
    this.register(
      'checkProductAvailability',
      {
        description: 'Check if a product is in stock',
        parameters: {
          type: 'object',
          properties: {
            productId: {
              type: 'string',
              description: 'Product ID to check'
            }
          }
        },
        required: ['productId']
      },
      async (params) => {
        const { productId } = params;
        
        if (!ObjectId.isValid(productId)) {
          throw new Error('Invalid product ID format');
        }
        
        const db = getDB();
        const product = await db.collection('products').findOne({
          _id: new ObjectId(productId)
        });
        
        if (!product) {
          throw new Error('Product not found');
        }
        
        return {
          productId: product._id.toString(),
          name: product.name,
          inStock: product.stock > 0,
          stock: product.stock,
          price: product.price
        };
      }
    );
  }
  
  /**
   * Check if a function exists
   */
  hasFunction(name) {
    return this.functions.has(name);
  }
  
  /**
   * Get function schema by name
   */
  getSchema(name) {
    const func = this.functions.get(name);
    return func ? func.schema : null;
  }
}

// Create singleton instance
const registry = new FunctionRegistry();

module.exports = registry;
