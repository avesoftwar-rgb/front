import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CheckoutPage from '../../pages/checkout'
import { useCart } from '../../lib/store'
import * as api from '../../lib/api'

vi.mock('../../lib/store')
vi.mock('../../lib/api')
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn()
  }
})

const mockCartItems = [
  {
    id: 'PROD001',
    qty: 2,
    product: {
      id: 'PROD001',
      title: 'Test Product 1',
      price: 100,
      image: '/test1.jpg',
      tags: ['electronics'],
      stockQty: 10,
      description: 'Test description'
    }
  }
]

describe('CheckoutPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders checkout page with order summary', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear: vi.fn()
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Qty: 2')).toBeInTheDocument()
    expect(screen.getByText('$200.00')).toBeInTheDocument() // Subtotal
    expect(screen.getByText('$16.00')).toBeInTheDocument() // Tax
    expect(screen.getByText('$216.00')).toBeInTheDocument() // Total
  })

  it('shows empty cart state', () => {
    vi.mocked(useCart).mockReturnValue({
      items: [],
      getTotal: () => 0,
      clear: vi.fn()
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
  })

  it('displays payment form fields', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear: vi.fn()
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Payment Information')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('1234 5678 9012 3456')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('MM/YY')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('123')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
  })

  it('shows demo checkout notice', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear: vi.fn()
    })

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Demo Checkout')).toBeInTheDocument()
    expect(screen.getByText(/no real payment will be processed/i)).toBeInTheDocument()
  })

  it('places order successfully', async () => {
    const clear = vi.fn()
    const mockNavigate = vi.fn()
    
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear
    })

    vi.mocked(api.placeOrder).mockResolvedValue({ orderId: 'ABC123' })

    const { useNavigate } = await import('react-router-dom')
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)

    await waitFor(() => {
      expect(api.placeOrder).toHaveBeenCalledWith({
        items: [{ id: 'PROD001', qty: 2 }]
      })
      expect(clear).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/order/ABC123')
    })
  })

  it('handles order placement error', async () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear: vi.fn()
    })

    vi.mocked(api.placeOrder).mockRejectedValue(new Error('Failed'))
    
    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Failed to place order. Please try again.')
    })

    alertSpy.mockRestore()
  })

  it('shows processing state while placing order', async () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      getTotal: () => 200,
      clear: vi.fn()
    })

    vi.mocked(api.placeOrder).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ orderId: 'ABC123' }), 100))
    )

    render(
      <BrowserRouter>
        <CheckoutPage />
      </BrowserRouter>
    )

    const placeOrderButton = screen.getByRole('button', { name: /place order/i })
    fireEvent.click(placeOrderButton)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(placeOrderButton).toBeDisabled()

    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument()
    })
  })
})
