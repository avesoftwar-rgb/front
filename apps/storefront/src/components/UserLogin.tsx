import React, { useState } from 'react'
import { api } from '../lib/api'

interface UserLoginProps {
  onLogin: (customer: any) => void
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const customer = await api.lookupCustomer(email)
      onLogin(customer)
    } catch (err: any) {
      setError(err.message || 'Failed to look up customer')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = () => {
    setEmail('demouser@example.com')
  }

  return (
    <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h2>Welcome to ShopSmart</h2>
      <p style={{ color: '#666', marginTop: '0.5rem' }}>
        Enter your email to access your account and orders
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Looking up...' : 'Continue'}
        </button>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleDemoLogin}
          style={{ width: '100%', marginTop: '0.5rem' }}
        >
          Use Demo Account
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f8f9fa', borderRadius: '4px' }}>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>
          <strong>Test Account:</strong> demouser@example.com
        </p>
        <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
          This is a demo system. No real orders will be placed.
        </p>
      </div>
    </div>
  )
}

export default UserLogin
