import React, { useState, useEffect } from 'react'
import { api, Order } from '../lib/api'
import { SSEClient, OrderStatusEvent } from '../lib/sse-client'

interface OrderTrackingProps {
  customer: any
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ customer }) => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [trackingEvents, setTrackingEvents] = useState<OrderStatusEvent[]>([])
  const [isTracking, setIsTracking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState('')
  const sseClient = React.useRef<SSEClient | null>(null)

  useEffect(() => {
    if (customer) {
      fetchCustomerOrders()
    }

    // Cleanup SSE on unmount
    return () => {
      if (sseClient.current) {
        sseClient.current.disconnect()
      }
    }
  }, [customer])

  const fetchCustomerOrders = async () => {
    if (!customer) return

    setLoading(true)
    try {
      const response = await api.getCustomerOrders(customer._id)
      setOrders(response.orders)
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTrackOrder = async () => {
    if (!orderId) return

    setLoading(true)
    setTrackingEvents([])
    
    try {
      // First fetch order details
      const order = await api.getOrder(orderId)
      setSelectedOrder(order)
      
      // Start SSE tracking
      startTracking(orderId)
    } catch (error) {
      console.error('Failed to fetch order:', error)
      alert('Order not found. Please check the ID and try again.')
    } finally {
      setLoading(false)
    }
  }

  const startTracking = (id: string) => {
    if (sseClient.current) {
      sseClient.current.disconnect()
    }

    sseClient.current = new SSEClient()
    setIsTracking(true)

    sseClient.current.connect(
      id,
      (event) => {
        console.log('Received SSE event:', event)
        setTrackingEvents((prev) => [...prev, event])
        
        if (event.status && selectedOrder) {
          setSelectedOrder({ ...selectedOrder, status: event.status as any })
        }
        
        if (event.type === 'complete') {
          setIsTracking(false)
        }
      },
      (error) => {
        console.error('SSE error:', error)
        setIsTracking(false)
      },
      () => {
        setIsTracking(false)
      }
    )
  }

  const stopTracking = () => {
    if (sseClient.current) {
      sseClient.current.disconnect()
      setIsTracking(false)
    }
  }


  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳'
      case 'PROCESSING': return '📦'
      case 'SHIPPED': return '🚚'
      case 'DELIVERED': return '✅'
      default: return '📋'
    }
  }

  if (!customer) {
    return (
      <div className="container">
        <div className="card">
          <p>Please log in to track your orders.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Order Tracking</h2>
      
      {/* Order ID Input */}
      <div className="card">
        <h3>Track by Order ID</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input
            type="text"
            className="input"
            placeholder="Enter Order ID (e.g., 507f1f77bcf86cd799439011)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            disabled={loading || isTracking}
          />
          <button 
            className="btn" 
            onClick={handleTrackOrder}
            disabled={loading || isTracking || !orderId}
          >
            {loading ? 'Loading...' : 'Track'}
          </button>
          {isTracking && (
            <button className="btn btn-secondary" onClick={stopTracking}>
              Stop Tracking
            </button>
          )}
        </div>
      </div>

      {/* Selected Order Details */}
      {selectedOrder && (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h3>Order #{selectedOrder._id}</h3>
              <p style={{ color: '#666', marginTop: '0.5rem' }}>
                Customer: {selectedOrder.customerName}
              </p>
              <p style={{ color: '#666' }}>
                Total: ${selectedOrder.total.toFixed(2)}
              </p>
              <p style={{ color: '#666' }}>
                Carrier: {selectedOrder.carrier}
              </p>
              <p style={{ color: '#666' }}>
                Est. Delivery: {new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span 
                className={`badge badge-${selectedOrder.status.toLowerCase()}`}
                style={{ fontSize: '1rem' }}
              >
                {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
              </span>
              {isTracking && (
                <p style={{ color: '#0066cc', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  🔴 Live Tracking Active
                </p>
              )}
            </div>
          </div>

          {/* Order Timeline */}
          <div style={{ marginTop: '2rem' }}>
            <h4>Status Timeline</h4>
            <div className="timeline" style={{ marginTop: '1rem' }}>
              {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((status) => {
                const statusIndex = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(status)
                const currentIndex = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].indexOf(selectedOrder.status)
                const isCompleted = statusIndex <= currentIndex
                
                return (
                  <div 
                    key={status} 
                    className={`timeline-item ${isCompleted ? 'completed' : ''}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: isCompleted ? 'bold' : 'normal' }}>
                        {getStatusIcon(status)} {status}
                      </span>
                      {isCompleted && (
                        <span style={{ fontSize: '0.875rem', color: '#666' }}>
                          ✓ Completed
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Live Events */}
          {trackingEvents.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h4>Live Updates</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
                {trackingEvents.map((event, index) => (
                  <div key={index} style={{ marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                    <span style={{ color: '#666' }}>
                      {new Date().toLocaleTimeString()}:
                    </span>{' '}
                    {event.type === 'status' && (
                      <span>Status updated to <strong>{event.status}</strong></span>
                    )}
                    {event.type === 'complete' && (
                      <span style={{ color: '#28a745' }}>✅ {event.message}</span>
                    )}
                    {event.type === 'error' && (
                      <span style={{ color: '#dc3545' }}>❌ {event.message}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Customer's Recent Orders */}
      <div className="card">
        <h3>Your Recent Orders</h3>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        ) : orders.length > 0 ? (
          <div style={{ marginTop: '1rem' }}>
            {orders.map((order) => (
              <div 
                key={order._id} 
                style={{ 
                  padding: '1rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  marginBottom: '1rem',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setOrderId(order._id)
                  setSelectedOrder(order)
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>Order #{order._id}</strong>
                    <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      {new Date(order.createdAt).toLocaleDateString()} - ${order.total.toFixed(2)}
                    </p>
                    <p style={{ fontSize: '0.875rem', color: '#666' }}>
                      {order.items.length} item(s)
                    </p>
                  </div>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#666' }}>No orders found.</p>
        )}
      </div>
    </div>
  )
}

export default OrderTracking
