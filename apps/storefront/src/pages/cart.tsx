import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../lib/store'
import { formatCurrency } from '../lib/format'

export default function CartPage() {
  const { items, setQty, remove, getTotal, getItemCount } = useCart()
  const navigate = useNavigate()

  const total = getTotal()
  const itemCount = getItemCount()

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to get started!</p>
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <span className="text-gray-600">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="card">
              <div className="flex items-center space-x-4">
                {/* Product Image */}
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/p/${item.product.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    {item.product.title}
                  </Link>
                  <p className="text-primary-600 font-semibold">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQty(item.id, item.qty - 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  
                  <span className="w-8 text-center font-medium">{item.qty}</span>
                  
                  <button
                    onClick={() => setQty(item.id, item.qty + 1)}
                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(item.product.price * item.qty)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => remove(item.id)}
                  className="text-red-600 hover:text-red-700 p-2 rounded-md hover:bg-red-50 transition-colors"
                  aria-label="Remove item"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(total * 0.08)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(total * 1.08)}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary"
            >
              Proceed to Checkout
            </button>

            <Link
              to="/"
              className="block w-full text-center mt-3 text-primary-600 hover:text-primary-700 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
