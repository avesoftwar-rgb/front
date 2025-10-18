import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import OrderStatusPage from '../../pages/order-status'
import * as api from '../../lib/api'

vi.mock('../../lib/api')

const mockOrderStatus = {
  orderId: 'ABC123DEF4',
  status: 'Shipped' as const,
  carrier: 'ACME Logistics',
  eta: '2025-10-15T00:00:00.000Z'
}

describe('OrderStatusPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders order status page', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue(mockOrderStatus)

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123DEF4']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Order Status')).toBeInTheDocument()
      expect(screen.getByText(/Order.*DEF4/)).toBeInTheDocument() // Masked ID
      expect(screen.getByText('Shipped')).toBeInTheDocument()
      expect(screen.getByText('ACME Logistics')).toBeInTheDocument()
    })
  })

  it('shows order progress timeline', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue(mockOrderStatus)

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123DEF4']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Order Progress')).toBeInTheDocument()
      expect(screen.getByText('Placed')).toBeInTheDocument()
      expect(screen.getByText('Packed')).toBeInTheDocument()
      expect(screen.getByText('Shipped')).toBeInTheDocument()
      expect(screen.getByText('Delivered')).toBeInTheDocument()
    })
  })

  it('shows carrier information when shipped', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue(mockOrderStatus)

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123DEF4']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Shipping Information')).toBeInTheDocument()
      expect(screen.getByText('Carrier')).toBeInTheDocument()
      expect(screen.getByText('ACME Logistics')).toBeInTheDocument()
      expect(screen.getByText('Estimated Delivery')).toBeInTheDocument()
    })
  })

  it('shows different status colors', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue({
      orderId: 'ABC123',
      status: 'Placed' as const
    })

    const { rerender } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Placed')).toBeInTheDocument()
    })

    // Test different statuses
    const statuses = ['Placed', 'Packed', 'Shipped', 'Delivered'] as const
    for (const status of statuses) {
      vi.mocked(api.getOrderStatus).mockResolvedValue({
        orderId: 'ABC123',
        status
      })
      
      rerender(
        <BrowserRouter>
          <Routes>
            <Route path="/order/:id" element={<OrderStatusPage />} />
          </Routes>
        </BrowserRouter>
      )

      await waitFor(() => {
        expect(screen.getByText(status)).toBeInTheDocument()
      })
    }
  })

  it('shows order not found state', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/INVALID']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Order Not Found')).toBeInTheDocument()
      expect(screen.getByText(/doesn't exist/i)).toBeInTheDocument()
      expect(screen.getByText('Back to Catalog')).toBeInTheDocument()
    })
  })

  it('handles loading state', () => {
    vi.mocked(api.getOrderStatus).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve(mockOrderStatus), 100))
    )

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123']
      }
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('handles API errors', async () => {
    vi.mocked(api.getOrderStatus).mockRejectedValue(new Error('API Error'))

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Order Not Found')).toBeInTheDocument()
      expect(screen.getByText(/Failed to load order status/i)).toBeInTheDocument()
    })
  })

  it('masks order ID for privacy', async () => {
    vi.mocked(api.getOrderStatus).mockResolvedValue({
      orderId: 'ABC123DEF456',
      status: 'Placed' as const
    })

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/order/:id" element={<OrderStatusPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/order/ABC123DEF456']
      }
    )

    await waitFor(() => {
      // Should show masked ID with last 4 digits
      expect(screen.getByText(/\*+F456/)).toBeInTheDocument()
      // Full ID should be shown separately
      expect(screen.getByText('Order ID: ABC123DEF456')).toBeInTheDocument()
    })
  })
})
