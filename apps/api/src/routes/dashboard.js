const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// Store assistant stats in memory (in production, use Redis or similar)
const assistantStats = {
  queries: [],
  functionCalls: [],
  intents: {}
};

// Update assistant stats (called by assistant engine)
router.post('/assistant-stats', (req, res) => {
  const { intent, functionsCalled, responseTime } = req.body;
  
  if (intent) {
    assistantStats.intents[intent] = (assistantStats.intents[intent] || 0) + 1;
    assistantStats.queries.push({
      intent,
      timestamp: new Date(),
      responseTime
    });
  }
  
  if (functionsCalled && Array.isArray(functionsCalled)) {
    assistantStats.functionCalls.push(...functionsCalled.map(f => ({
      function: f,
      timestamp: new Date()
    })));
  }
  
  // Keep only last 1000 queries to prevent memory overflow
  if (assistantStats.queries.length > 1000) {
    assistantStats.queries = assistantStats.queries.slice(-1000);
  }
  if (assistantStats.functionCalls.length > 1000) {
    assistantStats.functionCalls = assistantStats.functionCalls.slice(-1000);
  }
  
  res.json({ success: true });
});

// GET /api/dashboard/business-metrics - Business KPIs
router.get('/business-metrics', async (req, res) => {
  try {
    const db = getDB();
    
    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    // Aggregate business metrics
    const [
      totalMetrics,
      todayMetrics,
      yesterdayMetrics,
      weeklyRevenue,
      categoryBreakdown
    ] = await Promise.all([
      // All-time metrics
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$total' }
          }
        }
      ]).toArray(),
      
      // Today's metrics
      db.collection('orders').aggregate([
        {
          $match: {
            createdAt: { $gte: today }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Yesterday's metrics (for comparison)
      db.collection('orders').aggregate([
        {
          $match: {
            createdAt: {
              $gte: yesterday,
              $lt: today
            }
          }
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Last 7 days revenue trend
      db.collection('orders').aggregate([
        {
          $match: {
            createdAt: { $gte: lastWeek }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            revenue: { $sum: '$total' },
            orders: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).toArray(),
      
      // Revenue by product category
      db.collection('orders').aggregate([
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            let: { productId: { $toObjectId: '$items.productId' } },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$_id', '$$productId'] }
                }
              }
            ],
            as: 'product'
          }
        },
        { $unwind: '$product' },
        {
          $group: {
            _id: '$product.category',
            revenue: { $sum: '$items.subtotal' },
            quantity: { $sum: '$items.quantity' }
          }
        },
        {
          $sort: { revenue: -1 }
        }
      ]).toArray()
    ]);
    
    const total = totalMetrics[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };
    const today_ = todayMetrics[0] || { revenue: 0, orders: 0 };
    const yesterday_ = yesterdayMetrics[0] || { revenue: 0, orders: 0 };
    
    // Calculate growth percentages
    const revenueGrowth = yesterday_.revenue > 0 
      ? ((today_.revenue - yesterday_.revenue) / yesterday_.revenue * 100).toFixed(1)
      : 0;
    const orderGrowth = yesterday_.orders > 0
      ? ((today_.orders - yesterday_.orders) / yesterday_.orders * 100).toFixed(1)
      : 0;
    
    res.json({
      summary: {
        totalRevenue: Math.round(total.totalRevenue * 100) / 100,
        totalOrders: total.totalOrders,
        avgOrderValue: Math.round(total.avgOrderValue * 100) / 100,
        todayRevenue: Math.round(today_.revenue * 100) / 100,
        todayOrders: today_.orders,
        revenueGrowth: parseFloat(revenueGrowth),
        orderGrowth: parseFloat(orderGrowth)
      },
      revenueChart: weeklyRevenue.map(item => ({
        date: item._id,
        revenue: Math.round(item.revenue * 100) / 100,
        orders: item.orders
      })),
      categoryBreakdown: categoryBreakdown.map(item => ({
        category: item._id || 'Uncategorized',
        revenue: Math.round(item.revenue * 100) / 100,
        quantity: item.quantity
      }))
    });
  } catch (error) {
    console.error('Business metrics error:', error);
    res.status(500).json({
      error: {
        code: 'METRICS_ERROR',
        message: 'Failed to retrieve business metrics'
      }
    });
  }
});

// GET /api/dashboard/performance - System performance metrics
router.get('/performance', async (req, res) => {
  try {
    const db = getDB();
    
    // Get database stats
    const dbStats = await db.stats();
    
    // Get collection counts
    const [customerCount, productCount, orderCount] = await Promise.all([
      db.collection('customers').estimatedDocumentCount(),
      db.collection('products').estimatedDocumentCount(),
      db.collection('orders').estimatedDocumentCount()
    ]);
    
    // Mock performance data (in production, track real metrics)
    const performanceData = {
      database: {
        connected: true,
        collections: dbStats.collections,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024 * 100) / 100, // MB
        documentCounts: {
          customers: customerCount,
          products: productCount,
          orders: orderCount
        }
      },
      api: {
        uptime: process.uptime(),
        memoryUsage: {
          rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
        },
        avgResponseTime: Math.floor(Math.random() * 100) + 50, // Mock data
        requestsPerMinute: Math.floor(Math.random() * 50) + 10, // Mock data
        errorRate: (Math.random() * 2).toFixed(2) + '%' // Mock data
      },
      sse: {
        activeConnections: Math.floor(Math.random() * 10), // Mock data
        totalStreamsToday: Math.floor(Math.random() * 100) + 50 // Mock data
      }
    };
    
    res.json(performanceData);
  } catch (error) {
    console.error('Performance metrics error:', error);
    res.status(500).json({
      error: {
        code: 'METRICS_ERROR',
        message: 'Failed to retrieve performance metrics'
      }
    });
  }
});

// GET /api/dashboard/assistant-stats - Assistant usage statistics
router.get('/assistant-stats', (req, res) => {
  try {
    // Calculate statistics from stored data
    const recentQueries = assistantStats.queries.slice(-100);
    const avgResponseTime = recentQueries.length > 0
      ? recentQueries.reduce((sum, q) => sum + (q.responseTime || 0), 0) / recentQueries.length
      : 0;
    
    // Count function calls
    const functionCallCounts = assistantStats.functionCalls.reduce((acc, call) => {
      acc[call.function] = (acc[call.function] || 0) + 1;
      return acc;
    }, {});
    
    // Get queries in last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentHourQueries = assistantStats.queries.filter(
      q => q.timestamp > oneHourAgo
    );
    
    res.json({
      totalQueries: assistantStats.queries.length,
      queriesLastHour: recentHourQueries.length,
      avgResponseTime: Math.round(avgResponseTime),
      intentDistribution: assistantStats.intents,
      functionCalls: functionCallCounts,
      recentQueries: recentQueries.slice(-10).reverse().map(q => ({
        intent: q.intent,
        timestamp: q.timestamp,
        responseTime: q.responseTime
      }))
    });
  } catch (error) {
    console.error('Assistant stats error:', error);
    res.status(500).json({
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to retrieve assistant statistics'
      }
    });
  }
});

// GET /api/dashboard/system-health - Overall system health check
router.get('/system-health', async (req, res) => {
  try {
    const db = getDB();
    
    // Check database connection
    let dbHealthy = false;
    try {
      await db.admin().ping();
      dbHealthy = true;
    } catch (err) {
      console.error('DB health check failed:', err);
    }
    
    // Check LLM service (mock for now)
    const llmHealthy = Math.random() > 0.1; // 90% uptime simulation
    
    // Get last system activity
    const lastOrder = await db.collection('orders')
      .findOne({}, { sort: { createdAt: -1 } });
    
    res.json({
      status: dbHealthy && llmHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: dbHealthy ? 'operational' : 'down',
          lastChecked: new Date().toISOString()
        },
        llm: {
          status: llmHealthy ? 'operational' : 'down',
          endpoint: process.env.LLM_ENDPOINT || 'Not configured',
          lastChecked: new Date().toISOString()
        },
        api: {
          status: 'operational',
          uptime: Math.floor(process.uptime()),
          version: '1.0.0'
        }
      },
      lastActivity: {
        lastOrder: lastOrder ? lastOrder.createdAt : null,
        activeUsers: Math.floor(Math.random() * 20) + 5 // Mock data
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      error: {
        code: 'HEALTH_CHECK_ERROR',
        message: 'Failed to perform health check'
      }
    });
  }
});

module.exports = router;
