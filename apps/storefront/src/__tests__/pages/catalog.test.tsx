import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CatalogPage from '../../pages/catalog'
import * as api from '../../lib/api'

vi.mock('../../lib/api')
vi.mock('../../lib/store', () => ({
  useCart: () => ({
    add: vi.fn()
  })
}))

const mockProducts = [
  {
    id: 'PROD001',
    title: 'Test Product 1',
    price: 99.99,
    image: '/test.jpg',
    tags: ['electronics', 'wireless'],
    stockQty: 10,
    description: 'Test description'
  },
  {
    id: 'PROD002',
    title: 'Test Product 2',
    price: 49.99,
    image: '/test2.jpg',
    tags: ['audio', 'portable'],
    stockQty: 5,
    description: 'Test description 2'
  }
]

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.listProducts).mockResolvedValue(mockProducts)
  })

  it('renders catalog page with products', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Product Catalog')).toBeInTheDocument()
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })
  })

  it('filters products by search term', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'Product 1' } })

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
      expect(screen.queryByText('Test Product 2')).not.toBeInTheDocument()
    })
  })

  it('sorts products by price', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const sortSelect = screen.getByLabelText(/sort by/i)
    fireEvent.change(sortSelect, { target: { value: 'price-asc' } })

    await waitFor(() => {
      const products = screen.getAllByText(/Test Product/i)
      expect(products[0]).toHaveTextContent('Test Product 2')
      expect(products[1]).toHaveTextContent('Test Product 1')
    })
  })

  it('filters products by tag', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const tagFilter = screen.getByLabelText(/filter by tag/i)
    fireEvent.change(tagFilter, { target: { value: 'audio' } })

    await waitFor(() => {
      expect(screen.queryByText('Test Product 1')).not.toBeInTheDocument()
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('shows empty state when no products match filter', async () => {
    render(
      <BrowserRouter>
        <CatalogPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText(/search products/i)
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    await waitFor(() => {
      expect(screen.getByText(/no products found/i)).toBeInTheDocument()
    })
  })
})
