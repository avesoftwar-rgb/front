import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProductPage from '../../pages/product'
import * as api from '../../lib/api'

vi.mock('../../lib/api')
vi.mock('../../lib/store', () => ({
  useCart: () => ({
    add: vi.fn()
  })
}))

const mockProduct = {
  id: 'PROD001',
  title: 'Test Product',
  price: 99.99,
  image: '/test.jpg',
  tags: ['electronics', 'wireless'],
  stockQty: 10,
  description: 'This is a test product description'
}

const mockRelatedProducts = [
  {
    id: 'PROD002',
    title: 'Related Product 1',
    price: 79.99,
    image: '/related1.jpg',
    tags: ['electronics'],
    stockQty: 5,
    description: 'Related product'
  },
  {
    id: 'PROD003',
    title: 'Related Product 2',
    price: 89.99,
    image: '/related2.jpg',
    tags: ['wireless'],
    stockQty: 8,
    description: 'Another related product'
  }
]

describe('ProductPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.getProduct).mockResolvedValue(mockProduct)
    vi.mocked(api.listProducts).mockResolvedValue([mockProduct, ...mockRelatedProducts])
  })

  it('renders product details', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/PROD001']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument()
      expect(screen.getByText('$99.99')).toBeInTheDocument()
      expect(screen.getByText('This is a test product description')).toBeInTheDocument()
      expect(screen.getByText('10 in Stock')).toBeInTheDocument()
    })
  })

  it('shows related products', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/PROD001']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Related Products')).toBeInTheDocument()
      expect(screen.getByText('Related Product 1')).toBeInTheDocument()
      expect(screen.getByText('Related Product 2')).toBeInTheDocument()
    })
  })

  it('shows out of stock state', async () => {
    vi.mocked(api.getProduct).mockResolvedValue({
      ...mockProduct,
      stockQty: 0
    })

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/PROD001']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('Out of Stock')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled()
    })
  })

  it('shows product not found state', async () => {
    vi.mocked(api.getProduct).mockResolvedValue(null)

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/INVALID']
      }
    )

    await waitFor(() => {
      expect(screen.getByText(/product not found/i)).toBeInTheDocument()
      expect(screen.getByText(/back to catalog/i)).toBeInTheDocument()
    })
  })

  it('adds product to cart', async () => {
    const addToCart = vi.fn()
    vi.mocked(useCart).mockReturnValue({ add: addToCart })

    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/PROD001']
      }
    )

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(addToCart).toHaveBeenCalledWith(mockProduct)
  })

  it('displays product categories', async () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/p/:id" element={<ProductPage />} />
        </Routes>
      </BrowserRouter>,
      {
        initialEntries: ['/p/PROD001']
      }
    )

    await waitFor(() => {
      expect(screen.getByText('electronics')).toBeInTheDocument()
      expect(screen.getByText('wireless')).toBeInTheDocument()
    })
  })
})
