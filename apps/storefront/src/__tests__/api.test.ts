import { describe, it, expect, vi, beforeEach } from 'vitest'
import { listProducts, getProduct, placeOrder, getOrderStatus } from '../lib/api'

// Mock fetch
global.fetch = vi.fn()

describe('API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('listProducts', () => {
    it('returns products from mock catalog', async () => {
      const mockProducts = [
        {
          id: 'PROD001',
          title: 'Test Product',
          price: 99.99,
          image: '/test.jpg',
          tags: ['test'],
          stockQty: 10
        }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const result = await listProducts()
      
      expect(fetch).toHaveBeenCalledWith('/mock-catalog.json')
      expect(result).toEqual(mockProducts)
    })

    it('handles fetch errors', async () => {
      // Reset the module to clear any cached state
      vi.resetModules()
      ;(fetch as any).mockRejectedValueOnce(new Error('Network error'))

      // Re-import the module to get fresh state
      const { listProducts } = await import('../lib/api')
      await expect(listProducts()).rejects.toThrow('Network error')
    })
  })

  describe('getProduct', () => {
    it('returns specific product by id', async () => {
      const mockProducts = [
        { id: 'PROD001', title: 'Test Product', price: 99.99, image: '/test.jpg', tags: ['test'], stockQty: 10 },
        { id: 'PROD002', title: 'Product 2', price: 199.99, image: '/2.jpg', tags: ['test'], stockQty: 5 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const result = await getProduct('PROD001')
      
      expect(result).toEqual(mockProducts[0])
    })

    it('returns null for non-existent product', async () => {
      const mockProducts = [
        { id: 'PROD001', title: 'Product 1', price: 99.99, image: '/1.jpg', tags: ['test'], stockQty: 10 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const result = await getProduct('NONEXISTENT')
      
      expect(result).toBeNull()
    })
  })

  describe('placeOrder', () => {
    it('creates order with valid cart', async () => {
      const mockProducts = [
        { id: 'PROD001', title: 'Product 1', price: 99.99, image: '/1.jpg', tags: ['test'], stockQty: 10 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const cart = {
        items: [{ id: 'PROD001', qty: 2 }]
      }

      const result = await placeOrder(cart)
      
      expect(result).toHaveProperty('orderId')
      expect(result.orderId).toMatch(/^[A-Z0-9]{10}$/)
    })

    it('throws error for non-existent product', async () => {
      const mockProducts = [
        { id: 'PROD001', title: 'Product 1', price: 99.99, image: '/1.jpg', tags: ['test'], stockQty: 10 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const cart = {
        items: [{ id: 'NONEXISTENT', qty: 1 }]
      }

      await expect(placeOrder(cart)).rejects.toThrow('Product not found')
    })

    it('throws error for insufficient stock', async () => {
      // Reset modules to clear cached state
      vi.resetModules()
      
      const mockProducts = [
        { id: 'PROD001', title: 'Product 1', price: 99.99, image: '/1.jpg', tags: ['test'], stockQty: 5 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      // Re-import to get fresh state
      const { placeOrder } = await import('../lib/api')

      const cart = {
        items: [{ id: 'PROD001', qty: 10 }]
      }

      await expect(placeOrder(cart)).rejects.toThrow('Insufficient stock')
    })
  })

  describe('getOrderStatus', () => {
    it('returns order status for existing order', async () => {
      // First create an order
      const mockProducts = [
        { id: 'PROD001', title: 'Product 1', price: 99.99, image: '/1.jpg', tags: ['test'], stockQty: 10 }
      ]

      ;(fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts
      })

      const cart = { items: [{ id: 'PROD001', qty: 1 }] }
      const orderResult = await placeOrder(cart)
      
      // Then check status
      const status = await getOrderStatus(orderResult.orderId)
      
      expect(status).toHaveProperty('orderId', orderResult.orderId)
      expect(status).toHaveProperty('status', 'Placed')
    })

    it('returns null for non-existent order', async () => {
      const status = await getOrderStatus('NONEXISTENT')
      expect(status).toBeNull()
    })
  })
})
