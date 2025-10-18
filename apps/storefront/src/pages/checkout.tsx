import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../lib/store'
import { placeOrder, api } from '../lib/api'
import { formatCurrency } from '../lib/format'

export default function CheckoutPage() {
  const { items, getTotal, clear } = useCart()
  const navigate = useNavigate()
  const [isProcessing, setIsProcessing] = React.useState(false)
  const [email, setEmail] = React.useState('')
  const [customerInfo, setCustomerInfo] = React.useState<any>(null)
  const [lookingUp, setLookingUp] = React.useState(false)
  const [error, setError] = React.useState('')

  const subtotal = getTotal()
  const tax = subtotal * 0.08
  const total = subtotal + tax

  const handleLookupCustomer = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }
    
    setLookingUp(true)
    setError('')
    try {
      const customer = await api.lookupCustomer(email)
      setCustomerInfo(customer)
    } catch (err: any) {
      setError('Customer not found. Try: demouser@example.com')
    } finally {
      setLookingUp(false)
    }
  }

  const handleUseDemoAccount = () => {
    setEmail('demouser@example.com')
  }

  const handlePlaceOrder = async () => {
    if (items.length === 0) return
    if (!customerInfo) {
      setError('Please identify yourself first')
      return
    }

    setIsProcessing(true)
    try {
      const orderData = {
        customerId: customerInfo._id,
        customerEmail: customerInfo.email,
        items: items.map(item => ({
          id: item.id,
          qty: item.qty
        }))
      }

      const result = await placeOrder(orderData)
      clear()
      navigate(`/order/${result.orderId}`)
    } catch (error) {
      console.error('Failed to place order:', error)
      alert('Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products to checkout!</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary"
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
        <p className="text-gray-600">Review your order and complete your purchase</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={item.product.image}
                      alt={item.product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.product.title}</p>
                    <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                  </div>
                </div>
                <p className="font-medium">{formatCurrency(item.product.price * item.qty)}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tax (8%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-green-600">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-lg font-bold text-primary-600">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Customer Information</h2>
          
          {!customerInfo ? (
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={lookingUp}
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleLookupCustomer}
                  disabled={lookingUp}
                  className="flex-1 py-2 px-4 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {lookingUp ? 'Looking up...' : 'Continue'}
                </button>
                <button
                  onClick={handleUseDemoAccount}
                  className="py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Use Demo Account
                </button>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-700">
                  <strong>Test Account:</strong> demouser@example.com
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-green-800 mb-2">Customer Identified</h3>
                <div className="space-y-1">
                  <p className="text-sm text-green-700">
                    <strong>Name:</strong> {customerInfo.name}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Email:</strong> {customerInfo.email}
                  </p>
                  {customerInfo.address && (
                    <p className="text-sm text-green-700">
                      <strong>Address:</strong> {customerInfo.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setCustomerInfo(null)
                    setEmail('')
                  }}
                  className="mt-3 text-sm text-green-600 hover:text-green-800 underline"
                >
                  Use different account
                </button>
              </div>
            </div>
          )}
          
          <hr className="my-6" />
          
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Information</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="input-field"
                disabled
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  className="input-field"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  className="input-field"
                  disabled
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name on Card
              </label>
              <input
                type="text"
                placeholder="John Doe"
                className="input-field"
                disabled
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-blue-800">Demo Checkout</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This is a demo checkout. No real payment will be processed. Click "Place Order" to create a test order.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isProcessing || !customerInfo}
            className={`w-full py-3 px-6 text-lg font-medium rounded-lg transition-colors ${
              isProcessing || !customerInfo
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary bg-primary-600 text-white hover:bg-primary-700'
            }`}
          >
            {!customerInfo ? 'Please identify yourself first' : isProcessing ? 'Processing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
