import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CartPage from '../../pages/cart'
import { useCart } from '../../lib/store'

vi.mock('../../lib/store')

const mockCartItems = [
  {
    id: 'PROD001',
    qty: 2,
    product: {
      id: 'PROD001',
      title: 'Test Product 1',
      price: 99.99,
      image: '/test1.jpg',
      tags: ['electronics'],
      stockQty: 10,
      description: 'Test description'
    }
  },
  {
    id: 'PROD002',
    qty: 1,
    product: {
      id: 'PROD002',
      title: 'Test Product 2',
      price: 49.99,
      image: '/test2.jpg',
      tags: ['audio'],
      stockQty: 5,
      description: 'Test description 2'
    }
  }
]

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders cart items', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty: vi.fn(),
      remove: vi.fn(),
      getTotal: () => 249.97,
      getItemCount: () => 3
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Shopping Cart')).toBeInTheDocument()
    expect(screen.getByText('3 items')).toBeInTheDocument()
    expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    expect(screen.getByText('$249.97')).toBeInTheDocument()
  })

  it('shows empty cart state', () => {
    vi.mocked(useCart).mockReturnValue({
      items: [],
      setQty: vi.fn(),
      remove: vi.fn(),
      getTotal: () => 0,
      getItemCount: () => 0
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.getByText('Continue Shopping')).toBeInTheDocument()
  })

  it('updates item quantity', () => {
    const setQty = vi.fn()
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty,
      remove: vi.fn(),
      getTotal: () => 249.97,
      getItemCount: () => 3
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    const increaseButtons = screen.getAllByLabelText('Increase quantity')
    fireEvent.click(increaseButtons[0])
    expect(setQty).toHaveBeenCalledWith('PROD001', 3)
  })

  it('removes item from cart', () => {
    const remove = vi.fn()
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty: vi.fn(),
      remove,
      getTotal: () => 249.97,
      getItemCount: () => 3
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    const removeButtons = screen.getAllByLabelText('Remove item')
    fireEvent.click(removeButtons[0])
    expect(remove).toHaveBeenCalledWith('PROD001')
  })

  it('displays order summary with tax', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty: vi.fn(),
      remove: vi.fn(),
      getTotal: () => 100,
      getItemCount: () => 2
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    expect(screen.getByText('Order Summary')).toBeInTheDocument()
    expect(screen.getByText('$100.00')).toBeInTheDocument() // Subtotal
    expect(screen.getByText('$8.00')).toBeInTheDocument() // Tax (8%)
    expect(screen.getByText('$108.00')).toBeInTheDocument() // Total
  })

  it('navigates to checkout', () => {
    const mockNavigate = vi.fn()
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom')
      return {
        ...actual,
        useNavigate: () => mockNavigate
      }
    })

    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty: vi.fn(),
      remove: vi.fn(),
      getTotal: () => 249.97,
      getItemCount: () => 3
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    const checkoutButton = screen.getByText('Proceed to Checkout')
    fireEvent.click(checkoutButton)
    expect(mockNavigate).toHaveBeenCalledWith('/checkout')
  })

  it('shows line item totals', () => {
    vi.mocked(useCart).mockReturnValue({
      items: mockCartItems,
      setQty: vi.fn(),
      remove: vi.fn(),
      getTotal: () => 249.97,
      getItemCount: () => 3
    })

    render(
      <BrowserRouter>
        <CartPage />
      </BrowserRouter>
    )

    // First item: 2 * 99.99 = 199.98
    expect(screen.getByText('$199.98')).toBeInTheDocument()
    // Second item: 1 * 49.99 = 49.99
    expect(screen.getByText('$49.99')).toBeInTheDocument()
  })
})
