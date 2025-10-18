const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - Allow all origins in demo mode
app.use(cors({
  origin: function(origin, callback) {
    // Allow all origins in demo mode
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Demo data
const demoProducts = [
  { _id: '1', name: 'Laptop Pro', price: 1299.99, category: 'electronics', stock: 10, description: 'High-performance laptop' },
  { _id: '2', name: 'Wireless Mouse', price: 29.99, category: 'electronics', stock: 50, description: 'Ergonomic wireless mouse' },
  { _id: '3', name: 'Coffee Maker', price: 89.99, category: 'home', stock: 20, description: 'Smart coffee maker' },
  { _id: '4', name: 'Running Shoes', price: 129.99, category: 'apparel', stock: 30, description: 'Professional running shoes' },
  { _id: '5', name: 'Backpack', price: 49.99, category: 'accessories', stock: 40, description: 'Durable travel backpack' }
];

const demoCustomer = {
  _id: '507f1f77bcf86cd799439011',
  name: 'Demo User',
  email: 'demouser@example.com',
  phone: '+1-555-0100',
  address: '123 Demo Street, Test City, TC 12345'
};

const demoOrders = [
  {
    _id: '507f1f77bcf86cd799439012',
    customerId: '507f1f77bcf86cd799439011',
    customerEmail: 'demouser@example.com',
    customerName: 'Demo User',
    items: [
      { productId: '1', name: 'Laptop Pro', price: 1299.99, quantity: 1, subtotal: 1299.99 }
    ],
    total: 1299.99,
    status: 'DELIVERED',
    carrier: 'Express Shipping',
    estimatedDelivery: new Date(),
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { status: 'PROCESSING', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { status: 'SHIPPED', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { status: 'DELIVERED', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439013',
    customerId: '507f1f77bcf86cd799439011',
    customerEmail: 'demouser@example.com',
    customerName: 'Demo User',
    items: [
      { productId: '2', name: 'Wireless Mouse', price: 29.99, quantity: 2, subtotal: 59.98 }
    ],
    total: 59.98,
    status: 'SHIPPED',
    carrier: 'Standard Shipping',
    estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { status: 'PROCESSING', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { status: 'SHIPPED', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439014',
    customerId: '507f1f77bcf86cd799439011',
    customerEmail: 'demouser@example.com',
    customerName: 'Demo User',
    items: [
      { productId: '3', name: 'Coffee Maker', price: 89.99, quantity: 1, subtotal: 89.99 }
    ],
    total: 89.99,
    status: 'PENDING',
    carrier: 'Standard Shipping',
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date() }
    ]
  }
];

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: 'demo',
    timestamp: new Date().toISOString()
  });
});

// Customers - Support both paths
app.get(['/api/customers', '/customers'], (req, res) => {
  const { email } = req.query;
  if (email === 'demouser@example.com') {
    res.json([demoCustomer]);
  } else {
    res.json([]);
  }
});

app.get(['/api/customers/:id', '/customers/:id'], (req, res) => {
  if (req.params.id === demoCustomer._id) {
    res.json(demoCustomer);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

app.post(['/api/customers', '/customers'], (req, res) => {
  const newCustomer = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date()
  };
  res.status(201).json(newCustomer);
});

// Products - Support both /api/products and /products
app.get(['/api/products', '/products'], (req, res) => {
  const { search, category, sort, page = 1, limit = 10 } = req.query;
  
  let filtered = [...demoProducts];
  
  if (search) {
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (sort === 'price_asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    filtered.sort((a, b) => b.price - a.price);
  }
  
  res.json({
    products: filtered,
    total: filtered.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

app.get(['/api/products/:id', '/products/:id'], (req, res) => {
  const product = demoProducts.find(p => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Orders - Support both paths
app.get(['/api/orders', '/orders'], (req, res) => {
  const { customerId } = req.query;
  if (customerId === demoCustomer._id) {
    res.json(demoOrders);
  } else {
    res.json([]);
  }
});

app.get(['/api/orders/:id', '/orders/:id'], (req, res) => {
  const order = demoOrders.find(o => o._id === req.params.id);
  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

app.post(['/api/orders', '/orders'], (req, res) => {
  const newOrder = {
    _id: Date.now().toString(),
    ...req.body,
    status: 'PENDING',
    createdAt: new Date(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date() }
    ]
  };
  res.status(201).json(newOrder);
});

// SSE for order tracking
app.get('/api/orders/:id/stream', (req, res) => {
  const order = demoOrders.find(o => o._id === req.params.id);
  
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send initial status
  res.write(`data: ${JSON.stringify({
    type: 'status',
    orderId: req.params.id,
    status: order.status,
    carrier: order.carrier,
    estimatedDelivery: order.estimatedDelivery,
    timestamp: new Date()
  })}\n\n`);
  
  // Simulate status progression for PENDING orders
  if (order.status === 'PENDING') {
    const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < statuses.length) {
        res.write(`data: ${JSON.stringify({
          type: 'status',
          orderId: req.params.id,
          status: statuses[index],
          carrier: 'Express Shipping',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          timestamp: new Date()
        })}\n\n`);
        index++;
      } else {
        res.write(`data: ${JSON.stringify({
          type: 'complete',
          message: 'Order has been delivered'
        })}\n\n`);
        clearInterval(interval);
        res.end();
      }
    }, 3000);
    
    req.on('close', () => {
      clearInterval(interval);
    });
  } else {
    res.write(`data: ${JSON.stringify({
      type: 'complete',
      message: 'Order tracking complete'
    })}\n\n`);
    res.end();
  }
});

// Analytics
app.get('/api/analytics/dashboard-metrics', (req, res) => {
  res.json({
    totalRevenue: 1449.96,
    totalOrders: 3,
    totalCustomers: 1,
    averageOrderValue: 483.32,
    recentOrders: demoOrders,
    topProducts: demoProducts.slice(0, 3).map(p => ({
      ...p,
      soldCount: Math.floor(Math.random() * 20) + 5,
      revenue: p.price * (Math.floor(Math.random() * 20) + 5)
    }))
  });
});

app.get('/api/analytics/daily-revenue', (req, res) => {
  res.json({
    data: [
      { date: '2025-10-10', revenue: 289.99 },
      { date: '2025-10-11', revenue: 459.98 },
      { date: '2025-10-12', revenue: 179.99 },
      { date: '2025-10-13', revenue: 520.00 }
    ]
  });
});

app.get('/api/analytics/product-performance', (req, res) => {
  res.json({
    products: demoProducts.map(p => ({
      ...p,
      views: Math.floor(Math.random() * 1000) + 100,
      sales: Math.floor(Math.random() * 50) + 5,
      revenue: p.price * (Math.floor(Math.random() * 50) + 5)
    }))
  });
});

// Dashboard
app.get('/api/dashboard/business-metrics', (req, res) => {
  res.json({
    revenue: {
      today: 520.00,
      week: 1449.96,
      month: 5239.84
    },
    orders: {
      pending: 1,
      processing: 0,
      shipped: 1,
      delivered: 1
    },
    customers: {
      new: 5,
      returning: 8,
      total: 13
    }
  });
});

app.get('/api/dashboard/performance', (req, res) => {
  res.json({
    averageLatency: 45,
    totalRequests: 1234,
    activeSSEConnections: 2,
    memoryUsage: {
      used: 67,
      total: 100
    }
  });
});

app.get('/api/dashboard/assistant-stats', (req, res) => {
  res.json({
    totalQueries: 156,
    avgResponseTime: 234,
    functionCalls: 89,
    intents: {
      policy_question: 45,
      order_status: 38,
      product_search: 28,
      complaint: 12,
      chitchat: 20,
      off_topic: 8,
      violation: 5
    }
  });
});

app.get('/api/dashboard/system-health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    services: {
      api: 'healthy',
      database: 'demo mode',
      assistant: 'ready'
    }
  });
});

// Assistant
app.post('/api/assistant/chat', (req, res) => {
  const { message } = req.body;
  
  // Simulate assistant response
  setTimeout(() => {
    res.json({
      response: `Hi! I'm Alex from ShopSmart customer support. You said: "${message}". How can I help you today?`,
      intent: 'chitchat',
      functionCalls: []
    });
  }, 500);
});

app.get('/api/assistant/info', (req, res) => {
  res.json({
    name: 'Alex',
    role: 'Customer Support Specialist',
    company: 'ShopSmart',
    capabilities: [
      'Order tracking',
      'Product inquiries',
      'Return policy',
      'General support'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🎉 Demo Server Running!
=======================
🚀 Server: http://localhost:${PORT}
📊 Mode: Demo (No Database Required)
✅ Status: Ready

Test Endpoints:
- Health: http://localhost:${PORT}/api/health
- Products: http://localhost:${PORT}/api/products
- Customer: http://localhost:${PORT}/api/customers?email=demouser@example.com

Frontend should connect to: http://localhost:5173
  `);
});

module.exports = app;
