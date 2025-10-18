const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function(origin, callback) {
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

// Data file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');
const CUSTOMERS_FILE = path.join(DATA_DIR, 'customers.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize data
function loadData(filePath, defaultData) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error);
  }
  return defaultData;
}

// Save data to file
function saveData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Data saved to ${filePath}`);
  } catch (error) {
    console.error(`Error saving to ${filePath}:`, error);
  }
}

// Initialize data
let products = loadData(PRODUCTS_FILE, [
  { _id: '1', name: 'Laptop Pro', price: 1299.99, category: 'electronics', stock: 10, description: 'High-performance laptop', imageUrl: '/laptop.jpg' },
  { _id: '2', name: 'Wireless Mouse', price: 29.99, category: 'electronics', stock: 50, description: 'Ergonomic wireless mouse', imageUrl: '/mouse.jpg' },
  { _id: '3', name: 'Coffee Maker', price: 89.99, category: 'home', stock: 20, description: 'Smart coffee maker', imageUrl: '/coffee.jpg' },
  { _id: '4', name: 'Running Shoes', price: 129.99, category: 'apparel', stock: 30, description: 'Professional running shoes', imageUrl: '/shoes.jpg' },
  { _id: '5', name: 'Backpack', price: 49.99, category: 'accessories', stock: 40, description: 'Durable travel backpack', imageUrl: '/backpack.jpg' }
]);

let customers = loadData(CUSTOMERS_FILE, [
  {
    _id: '507f1f77bcf86cd799439011',
    name: 'Demo User',
    email: 'demouser@example.com',
    phone: '+1-555-0100',
    address: '123 Demo Street, Test City, TC 12345',
    createdAt: new Date().toISOString()
  }
]);

let orders = loadData(ORDERS_FILE, []);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    mode: 'dynamic',
    dataFiles: {
      products: fs.existsSync(PRODUCTS_FILE),
      customers: fs.existsSync(CUSTOMERS_FILE),
      orders: fs.existsSync(ORDERS_FILE)
    },
    stats: {
      products: products.length,
      customers: customers.length,
      orders: orders.length
    },
    timestamp: new Date().toISOString()
  });
});

// Products CRUD
app.get(['/api/products', '/products'], (req, res) => {
  const { search, category, sort, page = 1, limit = 10 } = req.query;
  
  let filtered = [...products];
  
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
  const product = products.find(p => p._id === req.params.id);
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.post(['/api/products', '/products'], (req, res) => {
  const newProduct = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  saveData(PRODUCTS_FILE, products);
  res.status(201).json(newProduct);
});

app.put(['/api/products/:id', '/products/:id'], (req, res) => {
  const index = products.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    products[index] = { ...products[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData(PRODUCTS_FILE, products);
    res.json(products[index]);
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

app.delete(['/api/products/:id', '/products/:id'], (req, res) => {
  const index = products.findIndex(p => p._id === req.params.id);
  if (index !== -1) {
    const deleted = products.splice(index, 1);
    saveData(PRODUCTS_FILE, products);
    res.json({ message: 'Product deleted', product: deleted[0] });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// Customers CRUD
app.get(['/api/customers', '/customers'], (req, res) => {
  const { email } = req.query;
  if (email) {
    const customer = customers.find(c => c.email === email);
    res.json(customer ? [customer] : []);
  } else {
    res.json(customers);
  }
});

app.get(['/api/customers/:id', '/customers/:id'], (req, res) => {
  const customer = customers.find(c => c._id === req.params.id);
  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

app.post(['/api/customers', '/customers'], (req, res) => {
  // Check if email already exists
  const existing = customers.find(c => c.email === req.body.email);
  if (existing) {
    return res.status(400).json({ error: 'Email already exists' });
  }
  
  const newCustomer = {
    _id: Date.now().toString(),
    ...req.body,
    createdAt: new Date().toISOString()
  };
  customers.push(newCustomer);
  saveData(CUSTOMERS_FILE, customers);
  res.status(201).json(newCustomer);
});

app.put(['/api/customers/:id', '/customers/:id'], (req, res) => {
  const index = customers.findIndex(c => c._id === req.params.id);
  if (index !== -1) {
    customers[index] = { ...customers[index], ...req.body, updatedAt: new Date().toISOString() };
    saveData(CUSTOMERS_FILE, customers);
    res.json(customers[index]);
  } else {
    res.status(404).json({ error: 'Customer not found' });
  }
});

// Orders CRUD
app.get(['/api/orders', '/orders'], (req, res) => {
  const { customerId } = req.query;
  if (customerId) {
    const customerOrders = orders.filter(o => o.customerId === customerId);
    res.json(customerOrders);
  } else {
    res.json(orders);
  }
});

app.get(['/api/orders/:id', '/orders/:id'], (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
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
    status: req.body.status || 'PENDING',
    createdAt: new Date().toISOString(),
    statusHistory: [
      { status: 'PENDING', timestamp: new Date().toISOString() }
    ]
  };
  
  // Update product stock
  if (newOrder.items) {
    newOrder.items.forEach(item => {
      const product = products.find(p => p._id === item.productId);
      if (product) {
        product.stock = Math.max(0, product.stock - item.quantity);
      }
    });
    saveData(PRODUCTS_FILE, products);
  }
  
  orders.push(newOrder);
  saveData(ORDERS_FILE, orders);
  res.status(201).json(newOrder);
});

app.put(['/api/orders/:id/status', '/orders/:id/status'], (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  if (order) {
    const { status } = req.body;
    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date().toISOString()
    });
    saveData(ORDERS_FILE, orders);
    res.json(order);
  } else {
    res.status(404).json({ error: 'Order not found' });
  }
});

// SSE for order tracking
app.get('/api/orders/:id/stream', (req, res) => {
  const order = orders.find(o => o._id === req.params.id);
  
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
  
  // Send current status
  res.write(`data: ${JSON.stringify({
    type: 'status',
    orderId: req.params.id,
    status: order.status,
    carrier: order.carrier || 'Standard Shipping',
    estimatedDelivery: order.estimatedDelivery,
    timestamp: new Date()
  })}\n\n`);
  
  // Simulate status progression for PENDING orders
  if (order.status === 'PENDING') {
    const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    let index = 0;
    
    const interval = setInterval(() => {
      if (index < statuses.length) {
        order.status = statuses[index];
        order.statusHistory.push({
          status: statuses[index],
          timestamp: new Date().toISOString()
        });
        saveData(ORDERS_FILE, orders);
        
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
    }, 5000); // Progress every 5 seconds
    
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

// Analytics with MongoDB-style Aggregation

// Daily Revenue Aggregation Endpoint
app.get('/api/analytics/daily-revenue', (req, res) => {
  try {
    const { from, to } = req.query;
    
    // IMPORTANT: Simulating MongoDB aggregation pipeline
    // In real MongoDB: db.orders.aggregate([...])
    
    // Filter orders by date range
    let filteredOrders = orders;
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date('2020-01-01');
      const toDate = to ? new Date(to + 'T23:59:59') : new Date();
      
      filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt || Date.now());
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }
    
    // Aggregation Pipeline (simulating MongoDB's aggregate())
    const pipeline = [
      // Stage 1: $group by date
      { $group: { _id: '$date', totalRevenue: { $sum: '$total' }, count: { $sum: 1 } } },
      // Stage 2: $project to reshape
      { $project: { date: '$_id', revenue: '$totalRevenue', orderCount: '$count' } },
      // Stage 3: $sort by date DESC
      { $sort: { date: -1 } },
      // Stage 4: $limit to 30 days
      { $limit: 30 }
    ];
    
    // Execute aggregation (database-level grouping)
    const aggregationResult = {};
    
    filteredOrders.forEach(order => {
      const date = order.createdAt ? 
        order.createdAt.split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      if (!aggregationResult[date]) {
        aggregationResult[date] = {
          date,
          revenue: 0,
          orderCount: 0,
          orders: []
        };
      }
      
      aggregationResult[date].revenue += order.total || 0;
      aggregationResult[date].orderCount += 1;
      aggregationResult[date].orders.push(order._id);
    });
    
    // Sort and format results
    const results = Object.values(aggregationResult)
      .map(day => ({
        date: day.date,
        revenue: Math.round(day.revenue * 100) / 100,
        orderCount: day.orderCount,
        averageOrderValue: Math.round((day.revenue / day.orderCount) * 100) / 100
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 30);
    
    res.json({
      aggregation: true,
      pipeline: ['$match', '$group', '$project', '$sort', '$limit'],
      results,
      metadata: {
        totalDays: results.length,
        dateRange: { from: from || 'all', to: to || 'today' },
        method: 'database_aggregation'
      }
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json({ 
      error: { 
        code: 'AGGREGATION_ERROR',
        message: 'Failed to execute aggregation pipeline' 
      }
    });
  }
});

// Dashboard Metrics
app.get('/api/analytics/dashboard-metrics', (req, res) => {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const topProducts = products.slice(0, 5).map(p => ({
    ...p,
    soldCount: orders.reduce((count, order) => {
      const item = order.items?.find(i => i.productId === p._id);
      return count + (item?.quantity || 0);
    }, 0)
  }));
  
  res.json({
    totalRevenue,
    totalOrders: orders.length,
    totalCustomers: customers.length,
    averageOrderValue: orders.length > 0 ? totalRevenue / orders.length : 0,
    recentOrders: orders.slice(-5).reverse(),
    topProducts: topProducts.sort((a, b) => b.soldCount - a.soldCount)
  });
});

// Dashboard endpoints for admin
app.get('/api/dashboard/business-metrics', (req, res) => {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  
  // Get revenue chart data (last 7 days)
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayRevenue = orders
      .filter(o => o.createdAt && o.createdAt.startsWith(dateStr))
      .reduce((sum, o) => sum + (o.total || 0), 0);
    
    last7Days.push({
      date: dateStr,
      revenue: dayRevenue
    });
  }
  
  // Orders by status
  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    summary: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders: orders.length,
      averageOrderValue: Math.round(avgOrderValue * 100) / 100,
      totalCustomers: customers.length
    },
    revenueChart: last7Days,
    ordersByStatus,
    categoryBreakdown: products.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = 0;
      const sold = orders.reduce((sum, o) => {
        const item = o.items?.find(i => i.productId === p._id);
        return sum + (item ? item.quantity * item.price : 0);
      }, 0);
      acc[p.category] += sold;
      return acc;
    }, {})
  });
});

app.get('/api/dashboard/performance', (req, res) => {
  res.json({
    database: {
      status: 'healthy',
      type: 'file-based',
      collections: {
        products: products.length,
        customers: customers.length,
        orders: orders.length
      }
    },
    api: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      responseTime: '< 100ms'
    },
    sse: {
      activeConnections: 0, // Would track in production
      supportedEvents: ['order_status']
    }
  });
});

app.get('/api/dashboard/assistant-stats', (req, res) => {
  // Mock assistant stats - would be tracked in production
  res.json({
    totalQueries: Math.floor(Math.random() * 100) + 50,
    intentDistribution: {
      policy_question: 35,
      order_status: 25,
      product_search: 20,
      complaint: 8,
      chitchat: 7,
      off_topic: 3,
      violation: 2
    },
    functionCalls: {
      getOrderStatus: 45,
      searchProducts: 38,
      getCustomerOrders: 22,
      getStorePolicy: 15
    },
    averageResponseTime: {
      policy_question: '1.2s',
      order_status: '0.8s',
      product_search: '1.5s',
      complaint: '2.1s'
    }
  });
});

app.get('/api/dashboard/system-health', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      database: 'healthy',
      api: 'healthy',
      sse: 'healthy',
      llm: 'simulated' // Would check actual LLM status
    },
    lastActivity: {
      order: orders[orders.length - 1]?.createdAt || 'No orders',
      customer: customers[customers.length - 1]?.createdAt || 'No customers'
    },
    timestamp: new Date().toISOString()
  });
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
  const stats = {
    products: {
      total: products.length,
      byCategory: products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {}),
      lowStock: products.filter(p => p.stock < 10).length
    },
    customers: {
      total: customers.length,
      newThisWeek: customers.filter(c => {
        const createdAt = new Date(c.createdAt || 0);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return createdAt > weekAgo;
      }).length
    },
    orders: {
      total: orders.length,
      byStatus: orders.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {}),
      revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    }
  };
  
  res.json(stats);
});

// Admin: Reset to default data
app.post('/api/admin/reset', (req, res) => {
  const { confirm } = req.body;
  if (confirm === 'RESET_ALL_DATA') {
    // Delete data files
    [PRODUCTS_FILE, CUSTOMERS_FILE, ORDERS_FILE].forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
      }
    });
    
    // Reload default data
    products = loadData(PRODUCTS_FILE, products.slice(0, 5));
    customers = loadData(CUSTOMERS_FILE, customers.slice(0, 1));
    orders = [];
    
    res.json({ message: 'All data reset to defaults' });
  } else {
    res.status(400).json({ error: 'Invalid confirmation' });
  }
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
🚀 Dynamic Server Running!
==========================
📊 Server: http://localhost:${PORT}
💾 Mode: Dynamic with File Storage
📁 Data Directory: ${DATA_DIR}
✅ Status: Ready

Features:
- ✅ Full CRUD operations on Products, Customers, Orders
- ✅ Data persists across server restarts
- ✅ Real-time stock updates
- ✅ Order status progression
- ✅ Analytics and statistics

Test Endpoints:
- Health: http://localhost:${PORT}/api/health
- Stats: http://localhost:${PORT}/api/stats
- Products: http://localhost:${PORT}/api/products
- Customer: http://localhost:${PORT}/api/customers?email=demouser@example.com

Admin:
- Reset Data: POST /api/admin/reset { "confirm": "RESET_ALL_DATA" }
  `);
});

module.exports = app;
