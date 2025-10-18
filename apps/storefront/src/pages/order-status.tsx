import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOrderStatus } from '../lib/api'
import { formatOrderId } from '../lib/format'
import type { OrderStatus } from '../types'

export default function OrderStatusPage() {
  const { id } = useParams<{ id: string }>()
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadOrderStatus(id)
    }
  }, [id])

  const loadOrderStatus = async (orderId: string) => {
    try {
      setLoading(true)
      const status = await getOrderStatus(orderId)
      if (status) {
        setOrderStatus(status)
      } else {
        setError('Order not found')
      }
    } catch (err) {
      setError('Failed to load order status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Placed':
        return 'bg-blue-100 text-blue-800'
      case 'Packed':
        return 'bg-yellow-100 text-yellow-800'
      case 'Shipped':
        return 'bg-purple-100 text-purple-800'
      case 'Delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Placed':
        return '📋'
      case 'Packed':
        return '📦'
      case 'Shipped':
        return '🚚'
      case 'Delivered':
        return '✅'
      default:
        return '❓'
    }
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
          {error || 'The order you\'re looking for doesn\'t exist or has been removed.'}
        </p>
        <Link to="/" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Status</h1>
        <p className="text-gray-600">Track your order progress</p>
      </div>

      {/* Order Info */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Order {formatOrderId(orderStatus.orderId)}
            </h2>
            <p className="text-gray-600">Order ID: {orderStatus.orderId}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(orderStatus.status)}`}>
            {getStatusIcon(orderStatus.status)} {orderStatus.status}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Progress</h3>
          
          <div className="space-y-3">
            {['Placed', 'Packed', 'Shipped', 'Delivered'].map((status, index) => {
              const isActive = orderStatus.status === status
              const isCompleted = ['Placed', 'Packed', 'Shipped', 'Delivered'].indexOf(orderStatus.status) >= index
              
              return (
                <div key={status} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isActive ? 'text-primary-600' : isCompleted ? 'text-gray-900' : 'text-gray-500'}`}>
                      {status}
                    </p>
                    {isActive && (
                      <p className="text-sm text-gray-600">
                        {status === 'Shipped' && orderStatus.carrier && `Carrier: ${orderStatus.carrier}`}
                        {status === 'Delivered' && 'Order has been delivered'}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional Info */}
        {(orderStatus.carrier || orderStatus.eta) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h3>
            <div className="space-y-2">
              {orderStatus.carrier && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier</span>
                  <span className="font-medium">{orderStatus.carrier}</span>
                </div>
              )}
              {orderStatus.eta && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Delivery</span>
                  <span className="font-medium">
                    {new Date(orderStatus.eta).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center space-x-4">
        <Link to="/" className="btn-secondary">
          Continue Shopping
        </Link>
        <Link to="/cart" className="btn-primary">
          View Cart
        </Link>
      </div>
    </div>
  )
}
