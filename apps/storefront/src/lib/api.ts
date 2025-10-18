import type { Product, OrderStatus } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

export async function listProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)
    if (!response.ok) throw new Error('Failed to fetch products')
    const data = await response.json()
    const products = data.products || data
    
    // Map API response to Product type
    return products.map((p: any) => ({
      id: p._id || p.id,
      title: p.name || p.title,
      price: p.price,
      image: p.image || p.imageUrl || '/placeholder.jpg',
      tags: p.tags || (p.category ? [p.category] : []),
      stockQty: p.stock || p.stockQty || 0,
      description: p.description
    }))
  } catch (error) {
    console.error('Failed to fetch products:', error)
    // Fallback to mock data if API fails
    const mockResponse = await fetch('/mock-catalog.json')
    return await mockResponse.json()
  }
}

export async function getProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)
    if (!response.ok) return null
    const p = await response.json()
    
    // Map API response to Product type
    return {
      id: p._id || p.id,
      title: p.name || p.title,
      price: p.price,
      image: p.image || p.imageUrl || '/placeholder.jpg',
      tags: p.tags || (p.category ? [p.category] : []),
      stockQty: p.stock || p.stockQty || 0,
      description: p.description
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

export async function placeOrder(orderData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    })
    
    if (!response.ok) {
      throw new Error('Failed to place order')
    }
    
    const result = await response.json()
    return { orderId: result._id || result.id || result.orderId }
  } catch (error) {
    console.error('Failed to place order:', error)
    throw error
  }
}

export async function getOrderStatus(id: string): Promise<OrderStatus | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`)
    if (!response.ok) return null
    const order = await response.json()
    return {
      orderId: order._id || order.id,
      status: order.status,
      carrier: order.carrier,
      eta: order.estimatedDelivery
    }
  } catch (error) {
    console.error('Failed to fetch order status:', error)
    return null
  }
}

// API object with additional methods
export const api = {
  // Lookup customer by email
  lookupCustomer: async (email: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers?email=${encodeURIComponent(email)}`)
      if (!response.ok) {
        throw new Error('Customer not found')
      }
      return await response.json()
    } catch (error) {
      console.error('Failed to lookup customer:', error)
      throw error
    }
  },
  
  // Get customer orders
  getCustomerOrders: async (customerId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders?customerId=${customerId}`)
      if (!response.ok) throw new Error('Failed to fetch orders')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch customer orders:', error)
      return []
    }
  },
  
  // Analytics endpoints
  getDashboardMetrics: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/business-metrics`)
      if (!response.ok) throw new Error('Failed to fetch metrics')
      return await response.json()
    } catch (error) {
      console.error('Failed to fetch dashboard metrics:', error)
      return null
    }
  }
}
