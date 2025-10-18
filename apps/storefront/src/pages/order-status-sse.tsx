import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api, createOrderSSE } from '../lib/api-client'

interface OrderStatusData {
  orderId: string
  status: string
  carrier?: string
  estimatedDelivery?: string
  customerName?: string
  items?: any[]
  total?: number
}

export default function OrderStatusSSE() {
  const { id } = useParams<{ id: string }>()
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sseConnection, setSseConnection] = useState<any>(null)

  useEffect(() => {
    if (id) {
      loadInitialOrder(id)
      setupSSE(id)
    }

    return () => {
      if (sseConnection) {
        sseConnection.close()
      }
    }
  }, [id])

  const loadInitialOrder = async (orderId: string) => {
    try {
      setLoading(true)
      const order = await api.getOrder(orderId)
      if (order) {
        setOrderStatus(order)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to load order')
    } finally {
      setLoading(false)
    }
  }

  const setupSSE = (orderId: string) => {
    const sse = createOrderSSE(orderId)
    setSseConnection(sse)

    sse.onStatusUpdate((data: any) => {
      setOrderStatus(prev => ({
        ...prev!,
        status: data.status,
        carrier: data.carrier,
        estimatedDelivery: data.estimatedDelivery
      }))
    })

    sse.onComplete((data: any) => {
      console.log('Order completed:', data)
    })

    sse.onError((error: any) => {
      console.error('SSE Error:', error)
      setError('Lost connection to order tracking')
    })
  }

  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'PENDING': 'bg-gray-100 text-gray-800',
      'PROCESSING': 'bg-yellow-100 text-yellow-800',
      'SHIPPED': 'bg-blue-100 text-blue-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return statusMap[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, string> = {
      'PENDING': '⏳',
      'PROCESSING': '⚙️',
      'SHIPPED': '🚚',
      'DELIVERED': '✅',
      'CANCELLED': '❌'
    }
    return iconMap[status] || '❓'
  }

  const getStatusSteps = () => {
    return ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !orderStatus) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">
          {error || 'The order you\'re looking for doesn\'t exist.'}
        </p>
        <Link to="/" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    )
  }

  const currentStatusIndex = getStatusSteps().indexOf(orderStatus.status)

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header with Live Indicator */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Order Tracking</h1>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-1"></span>
            Live
          </span>
        </div>
        <p className="text-gray-600">Real-time order status updates</p>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order #{orderStatus.orderId?.slice(-8) || id?.slice(-8)}
            </h2>
            <p className="text-gray-600">
              {orderStatus.customerName && `Customer: ${orderStatus.customerName}`}
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(orderStatus.status)}`}>
            {getStatusIcon(orderStatus.status)} {orderStatus.status}
          </div>
        </div>

        {/* Status Timeline with Animation */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-300"></div>
            <div 
              className="absolute left-4 top-8 w-0.5 bg-primary-600 transition-all duration-500"
              style={{ height: `${Math.min(currentStatusIndex * 33, 100)}%` }}
            ></div>

            {/* Status Steps */}
            <div className="space-y-8">
              {getStatusSteps().map((status, index) => {
                const isActive = orderStatus.status === status
                const isCompleted = currentStatusIndex >= index
                const isPending = currentStatusIndex < index

                return (
                  <div key={status} className="relative flex items-start">
                    {/* Status Circle */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      transition-all duration-300 z-10 bg-white
                      ${isCompleted ? 'ring-4 ring-primary-100 bg-primary-600 text-white' : 
                        isPending ? 'ring-2 ring-gray-200 bg-gray-100 text-gray-400' : ''}
                      ${isActive ? 'scale-110 animate-pulse' : ''}
                    `}>
                      {isCompleted ? '✓' : index + 1}
                    </div>

                    {/* Status Content */}
                    <div className="ml-4 flex-1">
                      <div className={`font-medium text-lg ${
                        isActive ? 'text-primary-600' : 
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </div>
                      
                      {isActive && (
                        <div className="mt-1 text-sm text-gray-600">
                          {status === 'PROCESSING' && 'Your order is being prepared'}
                          {status === 'SHIPPED' && orderStatus.carrier && (
                            <div>
                              <p>Shipped via {orderStatus.carrier}</p>
                              {orderStatus.estimatedDelivery && (
                                <p>Expected: {new Date(orderStatus.estimatedDelivery).toLocaleDateString()}</p>
                              )}
                            </div>
                          )}
                          {status === 'DELIVERED' && 'Order has been delivered successfully'}
                          {status === 'PENDING' && 'Order received and awaiting processing'}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    {isCompleted && (
                      <div className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        {orderStatus.items && orderStatus.items.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {orderStatus.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            {orderStatus.total && (
              <div className="mt-4 pt-4 border-t flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">${orderStatus.total.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}

        {/* Shipping Information */}
        {(orderStatus.carrier || orderStatus.estimatedDelivery) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {orderStatus.carrier && (
                <div>
                  <p className="text-gray-600 text-sm">Carrier</p>
                  <p className="font-medium">{orderStatus.carrier}</p>
                </div>
              )}
              {orderStatus.estimatedDelivery && (
                <div>
                  <p className="text-gray-600 text-sm">Estimated Delivery</p>
                  <p className="font-medium">
                    {new Date(orderStatus.estimatedDelivery).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Link to="/" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
          Continue Shopping
        </Link>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          Refresh Status
        </button>
      </div>
    </div>
  )
}
