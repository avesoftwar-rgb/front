// API Client for Backend Communication

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          message: `HTTP Error ${response.status}` 
        }))
        throw new Error(error.message || `Request failed: ${response.status}`)
      }

      // Check if response has content
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }
      
      return response
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error)
      throw error
    }
  }

  // GET request
  async get(endpoint: string, params?: Record<string, any>) {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : ''
    
    return this.request(endpoint + queryString, {
      method: 'GET',
    })
  }

  // POST request
  async post(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  // PATCH request
  async patch(endpoint: string, data?: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient(API_BASE_URL)

// Export specific API functions for easier use
export const api = {
  // Customers
  async getCustomerByEmail(email: string) {
    return apiClient.get('/api/customers', { email })
  },

  async getCustomer(id: string) {
    return apiClient.get(`/api/customers/${id}`)
  },

  async createCustomer(data: any) {
    return apiClient.post('/api/customers', data)
  },

  // Products
  async getProducts(params?: {
    search?: string
    category?: string
    sort?: string
    page?: number
    limit?: number
  }) {
    return apiClient.get('/api/products', params)
  },

  async getProduct(id: string) {
    return apiClient.get(`/api/products/${id}`)
  },

  // Orders
  async createOrder(data: {
    customerId: string
    items: Array<{
      productId: string
      quantity: number
    }>
  }) {
    return apiClient.post('/api/orders', data)
  },

  async getOrder(id: string) {
    return apiClient.get(`/api/orders/${id}`)
  },

  async getCustomerOrders(customerId: string) {
    return apiClient.get('/api/orders', { customerId })
  },

  // Analytics
  async getDailyRevenue(from?: string, to?: string) {
    return apiClient.get('/api/analytics/daily-revenue', { from, to })
  },

  async getDashboardMetrics() {
    return apiClient.get('/api/analytics/dashboard-metrics')
  },

  async getProductPerformance() {
    return apiClient.get('/api/analytics/product-performance')
  },

  // Dashboard
  async getBusinessMetrics() {
    return apiClient.get('/api/dashboard/business-metrics')
  },

  async getPerformance() {
    return apiClient.get('/api/dashboard/performance')
  },

  async getAssistantStats() {
    return apiClient.get('/api/dashboard/assistant-stats')
  },

  async getSystemHealth() {
    return apiClient.get('/api/dashboard/system-health')
  },

  // Assistant
  async sendChatMessage(message: string) {
    return apiClient.post('/api/assistant/chat', { message })
  },

  async getAssistantInfo() {
    return apiClient.get('/api/assistant/info')
  },
}

// SSE Helper for Order Tracking
export function createOrderSSE(orderId: string) {
  const eventSource = new EventSource(`${API_BASE_URL}/api/orders/${orderId}/stream`)
  
  return {
    eventSource,
    
    onStatusUpdate(callback: (data: any) => void) {
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'status') {
            callback(data)
          }
        } catch (error) {
          console.error('SSE Parse Error:', error)
        }
      })
    },
    
    onComplete(callback: (data: any) => void) {
      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'complete') {
            callback(data)
            eventSource.close()
          }
        } catch (error) {
          console.error('SSE Parse Error:', error)
        }
      })
    },
    
    onError(callback: (error: any) => void) {
      eventSource.addEventListener('error', callback)
    },
    
    close() {
      eventSource.close()
    }
  }
}

export default apiClient
