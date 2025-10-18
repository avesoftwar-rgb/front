const express = require('express');
const { getDB } = require('../db');

const router = express.Router();

// GET /api/analytics/daily-revenue - Get daily revenue using database aggregation
router.get('/daily-revenue', async (req, res) => {
  try {
    const { from, to } = req.query;
    
    // Build date filter
    const dateFilter = {};
    
    if (from) {
      const fromDate = new Date(from);
      if (isNaN(fromDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid from date format. Use YYYY-MM-DD'
          }
        });
      }
      fromDate.setHours(0, 0, 0, 0);
      dateFilter.$gte = fromDate;
    }
    
    if (to) {
      const toDate = new Date(to);
      if (isNaN(toDate.getTime())) {
        return res.status(400).json({
          error: {
            code: 'INVALID_DATE',
            message: 'Invalid to date format. Use YYYY-MM-DD'
          }
        });
      }
      toDate.setHours(23, 59, 59, 999);
      dateFilter.$lte = toDate;
    }
    
    const db = getDB();
    
    // MongoDB aggregation pipeline for daily revenue
    const pipeline = [
      // Filter by date range if provided
      ...(Object.keys(dateFilter).length > 0 ? [{
        $match: { createdAt: dateFilter }
      }] : []),
      
      // Group by date (day granularity)
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      
      // Sort by date
      {
        $sort: { _id: 1 }
      },
      
      // Reshape output
      {
        $project: {
          date: '$_id',
          revenue: { $round: ['$revenue', 2] },
          orderCount: 1,
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          _id: 0
        }
      }
    ];
    
    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    res.json(results);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to generate analytics'
      }
    });
  }
});

// GET /api/analytics/dashboard-metrics - Get key metrics for dashboard
router.get('/dashboard-metrics', async (req, res) => {
  try {
    const db = getDB();
    
    // Calculate metrics using aggregation
    const [
      revenueMetrics,
      orderMetrics,
      productMetrics,
      customerMetrics,
      statusBreakdown,
      topProducts,
      recentOrders
    ] = await Promise.all([
      // Total revenue and average order value
      db.collection('orders').aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            avgOrderValue: { $avg: '$total' },
            orderCount: { $sum: 1 }
          }
        }
      ]).toArray(),
      
      // Orders by time period
      db.collection('orders').aggregate([
        {
          $facet: {
            today: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                  }
                }
              },
              { $count: 'count' }
            ],
            thisWeek: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  }
                }
              },
              { $count: 'count' }
            ],
            thisMonth: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
                  }
                }
              },
              { $count: 'count' }
            ]
          }
        }
      ]).toArray(),
      
      // Product metrics
      db.collection('products').aggregate([
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalStock: { $sum: '$stock' },
            avgPrice: { $avg: '$price' }
          }
        }
      ]).toArray(),
      
      // Customer metrics
      db.collection('customers').countDocuments(),
      
      // Orders by status
      db.collection('orders').aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).toArray(),
      
      // Top selling products
      db.collection('orders').aggregate([
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            quantitySold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.subtotal' }
          }
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 }
      ]).toArray(),
      
      // Recent orders
      db.collection('orders')
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray()
    ]);
    
    // Process results
    const revenue = revenueMetrics[0] || { totalRevenue: 0, avgOrderValue: 0, orderCount: 0 };
    const orders = orderMetrics[0] || { today: [], thisWeek: [], thisMonth: [] };
    const products = productMetrics[0] || { totalProducts: 0, totalStock: 0, avgPrice: 0 };
    
    res.json({
      revenue: {
        total: Math.round(revenue.totalRevenue * 100) / 100,
        avgOrderValue: Math.round(revenue.avgOrderValue * 100) / 100,
        totalOrders: revenue.orderCount
      },
      orders: {
        today: orders.today[0]?.count || 0,
        thisWeek: orders.thisWeek[0]?.count || 0,
        thisMonth: orders.thisMonth[0]?.count || 0
      },
      products: {
        total: products.totalProducts,
        totalStock: products.totalStock,
        avgPrice: Math.round(products.avgPrice * 100) / 100
      },
      customers: {
        total: customerMetrics
      },
      orderStatusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      topProducts: topProducts.map(p => ({
        name: p._id,
        quantitySold: p.quantitySold,
        revenue: Math.round(p.revenue * 100) / 100
      })),
      recentOrders: recentOrders.map(o => ({
        _id: o._id,
        customerName: o.customerName,
        total: o.total,
        status: o.status,
        createdAt: o.createdAt
      }))
    });
  } catch (error) {
    console.error('Dashboard metrics error:', error);
    res.status(500).json({
      error: {
        code: 'METRICS_ERROR',
        message: 'Failed to generate dashboard metrics'
      }
    });
  }
});

// GET /api/analytics/product-performance - Product performance analytics
router.get('/product-performance', async (req, res) => {
  try {
    const db = getDB();
    
    const pipeline = [
      { $unwind: '$items' },
      {
        $group: {
          _id: {
            productId: '$items.productId',
            productName: '$items.name'
          },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          orderCount: { $sum: 1 },
          avgQuantityPerOrder: { $avg: '$items.quantity' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $project: {
          productId: '$_id.productId',
          productName: '$_id.productName',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1,
          avgQuantityPerOrder: { $round: ['$avgQuantityPerOrder', 2] },
          _id: 0
        }
      }
    ];
    
    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    res.json(results);
  } catch (error) {
    console.error('Product performance error:', error);
    res.status(500).json({
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to generate product performance analytics'
      }
    });
  }
});

// GET /api/analytics/customer-insights - Customer purchase insights
router.get('/customer-insights', async (req, res) => {
  try {
    const db = getDB();
    
    const pipeline = [
      {
        $group: {
          _id: '$customerId',
          customerEmail: { $first: '$customerEmail' },
          customerName: { $first: '$customerName' },
          orderCount: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
          lastOrderDate: { $max: '$createdAt' },
          firstOrderDate: { $min: '$createdAt' }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: 20
      },
      {
        $project: {
          customerId: '$_id',
          customerEmail: 1,
          customerName: 1,
          orderCount: 1,
          totalSpent: { $round: ['$totalSpent', 2] },
          avgOrderValue: { $round: ['$avgOrderValue', 2] },
          lastOrderDate: 1,
          firstOrderDate: 1,
          _id: 0
        }
      }
    ];
    
    const results = await db.collection('orders').aggregate(pipeline).toArray();
    
    res.json(results);
  } catch (error) {
    console.error('Customer insights error:', error);
    res.status(500).json({
      error: {
        code: 'ANALYTICS_ERROR',
        message: 'Failed to generate customer insights'
      }
    });
  }
});

module.exports = router;
