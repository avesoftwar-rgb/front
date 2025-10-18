/**
 * Demo Server with In-Memory Database
 * للاختبار السريع بدون MongoDB
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// In-Memory Database
const db = {
  customers: [
    { _id: '1', name: 'Demo User', email: 'demouser@example.com', phone: '+1234567890', address: '123 Main St' },
    { _id: '2', name: 'John Doe', email: 'john@example.com', phone: '+9876543210', address: '456 Park Ave' }
  ],
  products: [
    { _id: '1', name: 'Laptop', price: 999, category: 'Electronics', stock: 10, imageUrl: '/laptop.jpg' },
    { _id: '2', name: 'Phone', price: 699, category: 'Electronics', stock: 25, imageUrl: '/phone.jpg' },
    { _id: '3', name: 'Shirt', price: 29, category: 'Clothing', stock: 100, imageUrl: '/shirt.jpg' }
  ],
  orders: [
    { 
      _id: '1', 
      customerId: '1', 
      items: [{ productId: '1', name: 'Laptop', price: 999, quantity: 1 }],
      total: 999,
      status: 'PENDING',
      createdAt: new Date()
    }
  ]
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Demo server running (in-memory database)' });
});

// Customers
app.get('/api/customers', (req, res) => {
  const { email } = req.query;
  if (email) {
    const customer = db.customers.find(c => c.email === email);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    return res.json(customer);
  }
  res.json(db.customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = db.customers.find(c => c._id === req.params.id);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

// Products
app.get('/api/products', (req, res) => {
  res.json(db.products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.products.find(p => p._id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// Orders
app.get('/api/orders', (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    const orders = db.orders.filter(o => o.customerId === customerId);
    return res.json(orders);
  }
  res.json(db.orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const newOrder = {
    _id: String(db.orders.length + 1),
    ...req.body,
    status: 'PENDING',
    createdAt: new Date()
  };
  db.orders.push(newOrder);
  res.status(201).json(newOrder);
});

// SSE for order tracking
app.get('/api/orders/:id/stream', (req, res) => {
  const order = db.orders.find(o => o._id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
  let currentIndex = statuses.indexOf(order.status);

  // Send current status
  res.write(`data: ${JSON.stringify({ status: order.status, timestamp: new Date() })}\n\n`);

  // Auto-progress status
  const interval = setInterval(() => {
    if (currentIndex < statuses.length - 1) {
      currentIndex++;
      order.status = statuses[currentIndex];
      res.write(`data: ${JSON.stringify({ status: order.status, timestamp: new Date() })}\n\n`);
      
      if (order.status === 'DELIVERED') {
        clearInterval(interval);
        res.end();
      }
    }
  }, 3000); // Progress every 3 seconds

  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Analytics (simple)
app.get('/api/analytics/daily-revenue', (req, res) => {
  const revenue = db.orders.reduce((sum, order) => sum + order.total, 0);
  res.json([{
    date: new Date().toISOString().split('T')[0],
    revenue,
    orderCount: db.orders.length
  }]);
});

// Dashboard metrics
app.get('/api/dashboard/business-metrics', (req, res) => {
  const totalRevenue = db.orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalRevenue / db.orders.length || 0;
  
  res.json({
    totalRevenue,
    totalOrders: db.orders.length,
    avgOrderValue,
    totalCustomers: db.customers.length,
    totalProducts: db.products.length
  });
});

// Additional analytics endpoints for admin dashboard
app.get('/api/analytics/dashboard-metrics', (req, res) => {
  const totalRevenue = db.orders.reduce((sum, order) => sum + order.total, 0);
  res.json({
    totalRevenue,
    totalOrders: db.orders.length,
    totalCustomers: db.customers.length,
    averageOrderValue: totalRevenue / db.orders.length || 0,
    recentOrders: db.orders.slice(-5),
    topProducts: db.products.slice(0, 5)
  });
});

app.get('/api/dashboard/performance', (req, res) => {
  res.json({
    apiLatency: 45,
    sseConnections: 2,
    llmResponseTime: 250,
    failedRequests: 0
  });
});

app.get('/api/dashboard/assistant-stats', (req, res) => {
  res.json({
    totalQueries: 127,
    intentsDistribution: {
      order_status: 45,
      policy_question: 32,
      product_search: 28,
      general: 22
    },
    functionCalls: 89,
    avgResponseTime: 280
  });
});

// Assistant endpoint (simple mock)
app.post('/api/assistant/chat', (req, res) => {
  const { message } = req.body;
  
  // Simple intent detection
  let intent = 'general';
  let response = 'How can I help you today?';
  
  if (message.toLowerCase().includes('order')) {
    intent = 'order_status';
    response = 'Your order #1 is currently PENDING. You can track it in your account.';
  } else if (message.toLowerCase().includes('return')) {
    intent = 'policy_question';
    response = 'Our return policy allows returns within 30 days of purchase. Items must be in original condition.';
  } else if (message.toLowerCase().includes('product')) {
    intent = 'product_search';
    response = 'We have laptops, phones, and clothing available. What are you looking for?';
  }
  
  res.json({
    intent,
    response,
    timestamp: new Date()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     🚀 DEMO SERVER RUNNING!            ║
║                                        ║
║     http://localhost:${PORT}           ║
║                                        ║
║     Using In-Memory Database           ║
║     (No MongoDB Required)              ║
║                                        ║
║     Test User: demouser@example.com   ║
╚════════════════════════════════════════╝
  `);
});
