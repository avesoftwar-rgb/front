const { ObjectId } = require('mongodb');
const { getDB } = require('../db');

// Track active SSE connections
const activeConnections = new Map();

// Order status progression with timing for auto-simulation
const statusProgression = {
  'PENDING': { next: 'PROCESSING', delay: 3000 },     // 3 seconds
  'PROCESSING': { next: 'SHIPPED', delay: 5000 },      // 5 seconds  
  'SHIPPED': { next: 'DELIVERED', delay: 5000 },       // 5 seconds
  'DELIVERED': { next: null, delay: 0 }
};

/**
 * Stream order status updates via SSE with automatic progression
 * Auto-simulates order fulfillment for testing purposes
 */
async function streamOrderStatus(req, res) {
  const { id } = req.params;
  
  // Validate order ID
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: 'Invalid order ID format'
      }
    });
  }
  
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'X-Accel-Buffering': 'no' // Disable Nginx buffering
  });
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(':heartbeat\n\n');
  }, 30000);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connection established' })}\n\n`);
  
  try {
    const db = getDB();
    const order = await db.collection('orders').findOne({ _id: new ObjectId(id) });
    
    if (!order) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: 'Order not found' })}\n\n`);
      clearInterval(keepAlive);
      res.end();
      return;
    }
    
    // Send current order status immediately
    res.write(`data: ${JSON.stringify({
      type: 'status_update',
      orderId: id,
      status: order.status,
      carrier: order.carrier || 'Standard Shipping',
      estimatedDelivery: order.estimatedDelivery,
      timestamp: new Date().toISOString()
    })}\n\n`);
    
    // Store connection
    const connectionId = `${id}-${Date.now()}`;
    activeConnections.set(connectionId, { res, orderId: id, keepAlive });
    
    // Auto-progress order status for testing
    const progressOrder = async (currentStatus) => {
      const progression = statusProgression[currentStatus];
      
      if (!progression || !progression.next) {
        // Order is delivered or in final state
        res.write(`data: ${JSON.stringify({
          type: 'completed',
          message: 'Order has been delivered',
          finalStatus: currentStatus
        })}\n\n`);
        clearInterval(keepAlive);
        activeConnections.delete(connectionId);
        res.end();
        return;
      }
      
      // Wait for the specified delay
      setTimeout(async () => {
        try {
          // Check if connection is still active
          if (!activeConnections.has(connectionId)) {
            return;
          }
          
          // Update order status in database
          const updateResult = await db.collection('orders').updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                status: progression.next,
                updatedAt: new Date()
              },
              $push: {
                statusHistory: {
                  status: progression.next,
                  timestamp: new Date()
                }
              }
            }
          );
          
          if (updateResult.modifiedCount > 0) {
            // Get updated order for carrier info
            const updatedOrder = await db.collection('orders').findOne({ _id: new ObjectId(id) });
            
            // Send status update to client
            const statusUpdate = {
              type: 'status_update',
              orderId: id,
              status: progression.next,
              previousStatus: currentStatus,
              carrier: updatedOrder.carrier || 'Standard Shipping',
              estimatedDelivery: updatedOrder.estimatedDelivery,
              timestamp: new Date().toISOString()
            };
            
            res.write(`data: ${JSON.stringify(statusUpdate)}\n\n`);
            
            // Continue progression
            progressOrder(progression.next);
          } else {
            // Failed to update, close connection
            res.write(`data: ${JSON.stringify({ type: 'error', message: 'Failed to update order' })}\n\n`);
            clearInterval(keepAlive);
            activeConnections.delete(connectionId);
            res.end();
          }
        } catch (error) {
          console.error('SSE update error:', error);
          res.write(`data: ${JSON.stringify({ type: 'error', message: 'Update failed' })}\n\n`);
          clearInterval(keepAlive);
          activeConnections.delete(connectionId);
          res.end();
        }
      }, progression.delay);
    };
    
    // Start auto-progression if order is not delivered
    if (order.status !== 'DELIVERED') {
      progressOrder(order.status);
    } else {
      // Order already delivered, close connection
      res.write(`data: ${JSON.stringify({
        type: 'completed',
        message: 'Order has been delivered',
        finalStatus: 'DELIVERED'
      })}\n\n`);
      setTimeout(() => {
        clearInterval(keepAlive);
        activeConnections.delete(connectionId);
        res.end();
      }, 1000);
    }
    
    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      activeConnections.delete(connectionId);
      console.log(`SSE connection closed for order ${id}`);
    });
    
  } catch (error) {
    console.error('SSE error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', message: 'Server error' })}\n\n`);
    clearInterval(keepAlive);
    res.end();
  }
}

// Get active SSE connections count
function getActiveConnections() {
  return activeConnections.size;
}

// Close all active connections (for cleanup)
function closeAllConnections() {
  activeConnections.forEach((conn) => {
    if (conn.keepAlive) {
      clearInterval(conn.keepAlive);
    }
    if (conn.res && !conn.res.writableEnded) {
      conn.res.end();
    }
  });
  activeConnections.clear();
}

module.exports = {
  streamOrderStatus,
  getActiveConnections,
  closeAllConnections
};
