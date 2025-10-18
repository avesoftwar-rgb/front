import { useState } from 'react'

interface EmailLookupProps {
  onCustomerFound: (customer: any) => void
  buttonText?: string
}

export default function EmailLookup({ onCustomerFound, buttonText = 'Continue' }: EmailLookupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    if (!email) {
      setError('Please enter your email')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Look up customer by email - NO PASSWORD NEEDED
      const response = await fetch(`http://localhost:3001/api/customers?email=${email}`)
      
      if (response.ok) {
        const customer = await response.json()
        onCustomerFound(customer)
      } else if (response.status === 404) {
        // Customer not found - you could auto-create here
        setError('Email not found. Please use: demouser@example.com')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } catch (err) {
      setError('Unable to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Enter Your Email</h3>
      <p className="text-sm text-gray-600 mb-4">
        No password needed - just your email to track orders
      </p>
      
      <div className="space-y-4">
        <input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={loading}
        />
        
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        
        <div className="text-xs text-gray-500">
          Test account: <code className="bg-gray-100 px-1 py-0.5 rounded">demouser@example.com</code>
        </div>
        
        <button
          onClick={handleLookup}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Looking up...' : buttonText}
        </button>
      </div>
    </div>
  )
}
