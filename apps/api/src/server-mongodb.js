const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// تحميل متغيرات البيئة
dotenv.config({ path: path.join(__dirname, '../.env') });

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

// تسجيل الطلبات
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// متغيرات MongoDB
let db;
let client;

// الاتصال بـ MongoDB Atlas
async function connectToDatabase() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopsmart';
    client = new MongoClient(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');
    
    db = client.db();
    
    // إنشاء الفهارس
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// إنشاء الفهارس لتحسين الأداء
async function createIndexes() {
  try {
    await db.collection('customers').createIndex({ email: 1 }, { unique: true });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    console.log('📑 Indexes created successfully');
  } catch (error) {
    console.error('Index creation error:', error);
  }
}

// Helper Functions
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

function formatError(code, message, details = {}) {
  return {
    error: {
      code,
      message,
      ...details
    }
  };
}

function validateRequiredFields(data, fields) {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }
  return { valid: true };
}

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = await db.admin().ping();
    
    res.json({
      status: 'healthy',
      mode: 'mongodb',
      database: {
        connected: dbStatus.ok === 1,
        name: db.databaseName
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// CUSTOMERS ENDPOINTS
app.get('/api/customers', async (req, res) => {
  try {
    const { email } = req.query;
    
    if (email) {
      const customer = await db.collection('customers').findOne({ email });
      res.json(customer ? [customer] : []);
    } else {
      const customers = await db.collection('customers').find({}).toArray();
      res.json(customers);
    }
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch customers'));
  }
});

app.get('/api/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid customer ID format'));
    }
    
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(id) });
    
    if (customer) {
      res.json(customer);
    } else {
      res.status(404).json(formatError('NOT_FOUND', 'Customer not found'));
    }
  } catch (error) {
    console.error('Get customer by ID error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch customer'));
  }
});

// PRODUCTS ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const { 
      search, 
      tag, 
      category, 
      sort = 'name', 
      page = 1, 
      limit = 10,
      minPrice,
      maxPrice
    } = req.query;
    
    let query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    let sortOption = {};
    switch(sort) {
      case 'price_asc':
        sortOption = { price: 1 };
        break;
      case 'price_desc':
        sortOption = { price: -1 };
        break;
      case 'name':
        sortOption = { name: 1 };
        break;
      case 'newest':
        sortOption = { _id: -1 };
        break;
      default:
        sortOption = { name: 1 };
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const [products, totalCount] = await Promise.all([
      db.collection('products')
        .find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .toArray(),
      db.collection('products').countDocuments(query)
    ]);
    
    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasNext: pageNum * limitNum < totalCount,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch products'));
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid product ID format'));
    }
    
    const product = await db.collection('products').findOne({ _id: new ObjectId(id) });
    
    if (product) {
      res.json(product);
    } else {
      res.status(404).json(formatError('NOT_FOUND', 'Product not found'));
    }
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch product'));
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const validation = validateRequiredFields(req.body, ['name', 'price', 'category']);
    if (!validation.valid) {
      return res.status(400).json(formatError('VALIDATION_ERROR', validation.error));
    }
    
    const { 
      name, 
      description = '', 
      price, 
      category, 
      tags = [], 
      imageUrl = '', 
      stock = 0 
    } = req.body;
    
    if (price < 0) {
      return res.status(400).json(formatError('VALIDATION_ERROR', 'Price cannot be negative'));
    }
    
    const newProduct = {
      name,
      description,
      price: parseFloat(price),
      category,
      tags: Array.isArray(tags) ? tags : [],
      imageUrl,
      stock: parseInt(stock),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(newProduct);
    
    res.status(201).json({
      ...newProduct,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to create product'));
  }
});

// ORDERS ENDPOINTS
app.get('/api/orders', async (req, res) => {
  try {
    const { customerId, status, page = 1, limit = 10 } = req.query;
    
    let query = {};
    
    if (customerId) {
      if (!isValidObjectId(customerId)) {
        return res.status(400).json(formatError('INVALID_ID', 'Invalid customer ID format'));
      }
      query.customerId = new ObjectId(customerId);
    }
    
    if (status) {
      query.status = status;
    }
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .toArray();
    
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch orders'));
  }
});

app.get('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!isValidObjectId(id)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid order ID format'));
    }
    
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json(formatError('NOT_FOUND', 'Order not found'));
    }
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch order'));
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const validation = validateRequiredFields(req.body, ['customerId', 'items']);
    if (!validation.valid) {
      return res.status(400).json(formatError('VALIDATION_ERROR', validation.error));
    }
    
    const { customerId, items } = req.body;
    
    if (!isValidObjectId(customerId)) {
      return res.status(400).json(formatError('INVALID_ID', 'Invalid customer ID format'));
    }
    
    const customer = await db.collection('customers').findOne({ _id: new ObjectId(customerId) });
    if (!customer) {
      return res.status(404).json(formatError('NOT_FOUND', 'Customer not found'));
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json(formatError('VALIDATION_ERROR', 'Items must be a non-empty array'));
    }
    
    const processedItems = [];
    let total = 0;
    
    for (const item of items) {
      if (!item.productId || !item.quantity) {
        return res.status(400).json(formatError('VALIDATION_ERROR', 'Each item must have productId and quantity'));
      }
      
      if (!isValidObjectId(item.productId)) {
        return res.status(400).json(formatError('INVALID_ID', `Invalid product ID: ${item.productId}`));
      }
      
      const product = await db.collection('products').findOne({ _id: new ObjectId(item.productId) });
      if (!product) {
        return res.status(404).json(formatError('NOT_FOUND', `Product not found: ${item.productId}`));
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json(formatError('INSUFFICIENT_STOCK', `Insufficient stock for product: ${product.name}`));
      }
      
      const processedItem = {
        productId: new ObjectId(item.productId),
        name: product.name,
        price: product.price,
        quantity: parseInt(item.quantity)
      };
      
      processedItems.push(processedItem);
      total += processedItem.price * processedItem.quantity;
    }
    
    const newOrder = {
      customerId: new ObjectId(customerId),
      customerName: customer.name,
      customerEmail: customer.email,
      items: processedItems,
      total: Math.round(total * 100) / 100,
      status: 'PENDING',
      carrier: 'Standard Shipping',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date()
        }
      ]
    };
    
    const result = await db.collection('orders').insertOne(newOrder);
    
    for (const item of processedItems) {
      await db.collection('products').updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }
    
    res.status(201).json({
      ...newOrder,
      _id: result.insertedId
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to create order'));
  }
});

// ⭐ ANALYTICS ENDPOINTS - MongoDB Aggregation (النقطة الأهم)
app.get('/api/analytics/daily-revenue', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // بناء شرط التصفية حسب التاريخ
    let matchStage = {};
    
    if (from || to) {
      matchStage.createdAt = {};
      
      if (from) {
        matchStage.createdAt.$gte = new Date(from);
      }
      
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        matchStage.createdAt.$lt = endDate;
      }
    }
    
    // MongoDB Aggregation Pipeline - هذا هو الجزء الأهم
    const pipeline = [
      // Stage 1: التصفية حسب التاريخ
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      
      // Stage 2: إضافة حقل التاريخ بدون الوقت
      {
        $addFields: {
          dateOnly: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          }
        }
      },
      
      // Stage 3: التجميع حسب اليوم
      {
        $group: {
          _id: '$dateOnly',
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          orders: { $push: '$_id' }
        }
      },
      
      // Stage 4: إعادة تشكيل البيانات
      {
        $project: {
          _id: 0,
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orderCount: 1,
          averageOrderValue: {
            $round: [
              { $divide: ['$revenue', '$orderCount'] },
              2
            ]
          }
        }
      },
      
      // Stage 5: الترتيب حسب التاريخ (الأحدث أولاً)
      {
        $sort: { date: -1 }
      },
      
      // Stage 6: تحديد عدد النتائج (آخر 30 يوم)
      {
        $limit: 30
      }
    ];
    
    // تنفيذ Aggregation Pipeline
    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    // حساب الإحصائيات الإجمالية
    const totalRevenue = results.reduce((sum, day) => sum + day.revenue, 0);
    const totalOrders = results.reduce((sum, day) => sum + day.orderCount, 0);
    
    res.json({
      success: true,
      aggregation: 'mongodb_native',
      pipeline: ['$match', '$addFields', '$group', '$project', '$sort', '$limit'],
      results,
      summary: {
        totalDays: results.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        averageRevenuePerDay: results.length > 0 ? 
          Math.round((totalRevenue / results.length) * 100) / 100 : 0,
        dateRange: {
          from: from || 'all',
          to: to || 'today'
        }
      }
    });
  } catch (error) {
    console.error('Analytics aggregation error:', error);
    res.status(500).json(formatError('AGGREGATION_ERROR', 'Failed to execute aggregation pipeline'));
  }
});

// Dashboard Metrics
app.get('/api/analytics/dashboard-metrics', async (req, res) => {
  try {
    // استخدام aggregation للحصول على إحصائيات متعددة
    const [orderStats, topProducts, recentOrders] = await Promise.all([
      // إحصائيات الطلبات
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]).toArray(),
      
      // أكثر المنتجات مبيعاً
      db.collection('orders').aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.name' },
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // آخر الطلبات
      db.collection('orders')
        .find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    ]);
    
    const stats = orderStats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };
    
    const totalCustomers = await db.collection('customers').estimatedDocumentCount();
    const totalProducts = await db.collection('products').estimatedDocumentCount();
    
    res.json({
      totalRevenue: Math.round((stats.totalRevenue || 0) * 100) / 100,
      totalOrders: stats.totalOrders || 0,
      totalCustomers,
      totalProducts,
      averageOrderValue: Math.round((stats.averageOrderValue || 0) * 100) / 100,
      topProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch dashboard metrics'));
  }
});

// Business Metrics Dashboard
app.get('/api/dashboard/business-metrics', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [revenueChart, ordersByStatus, categoryBreakdown, summary] = await Promise.all([
      // Revenue for last 7 days
      db.collection('orders').aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo } } },
        {
          $addFields: {
            dateOnly: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          }
        },
        {
          $group: {
            _id: '$dateOnly',
            revenue: { $sum: '$total' }
          }
        },
        {
          $project: {
            _id: 0,
            date: '$_id',
            revenue: { $round: ['$revenue', 2] }
          }
        },
        { $sort: { date: 1 } }
      ]).toArray(),
      
      // Orders by status
      db.collection('orders').aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]).toArray(),
      
      // Revenue by category
      db.collection('orders').aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product'
          }
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $project: {
            _id: 0,
            category: { $ifNull: ['$_id', 'Unknown'] },
            revenue: { $round: ['$revenue', 2] }
          }
        }
      ]).toArray(),
      
      // Summary stats
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]).toArray()
    ]);
    
    const summaryData = summary[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0
    };
    
    const totalCustomers = await db.collection('customers').estimatedDocumentCount();
    
    res.json({
      summary: {
        totalRevenue: Math.round((summaryData.totalRevenue || 0) * 100) / 100,
        totalOrders: summaryData.totalOrders || 0,
        averageOrderValue: Math.round((summaryData.averageOrderValue || 0) * 100) / 100,
        totalCustomers
      },
      revenueChart,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      categoryBreakdown
    });
  } catch (error) {
    console.error('Business metrics error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch business metrics'));
  }
});

// Performance Metrics
app.get('/api/dashboard/performance', async (req, res) => {
  try {
    const dbStats = await db.stats();
    
    res.json({
      database: {
        status: 'healthy',
        type: 'mongodb_atlas',
        size: dbStats.dataSize,
        collections: {
          products: await db.collection('products').estimatedDocumentCount(),
          customers: await db.collection('customers').estimatedDocumentCount(),
          orders: await db.collection('orders').estimatedDocumentCount()
        }
      },
      api: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        responseTime: '< 50ms'
      },
      sse: {
        activeConnections: 0,
        supportedEvents: ['order_status']
      }
    });
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch performance metrics'));
  }
});

// Assistant Stats
app.get('/api/dashboard/assistant-stats', async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Assistant stats error:', error);
    res.status(500).json(formatError('DB_ERROR', 'Failed to fetch assistant stats'));
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json(formatError('NOT_FOUND', 'The requested resource was not found'));
});

// Start server
async function startServer() {
  await connectToDatabase();
  
  app.listen(PORT, () => {
    console.log(`
🚀 MongoDB Server Running!
==========================
📊 Server: http://localhost:${PORT}
💾 Mode: MongoDB Atlas
✅ Status: Connected

Test Endpoints:
- Health: http://localhost:${PORT}/api/health
- Products: http://localhost:${PORT}/api/products
- Customers: http://localhost:${PORT}/api/customers?email=demouser@example.com
    `);
  });
}

// Error handling
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  if (client) {
    await client.close();
    console.log('MongoDB connection closed.');
  }
  process.exit(0);
});

// Start the server
startServer().catch(console.error);

module.exports = app;
