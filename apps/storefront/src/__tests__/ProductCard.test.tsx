import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import ProductCard from '../components/molecules/ProductCard'
import type { Product } from '../types'

const mockProduct: Product = {
  id: 'PROD001',
  title: 'Test Product',
  price: 99.99,
  image: '/test-image.jpg',
  tags: ['test', 'electronics'],
  stockQty: 10,
  description: 'Test product description'
}

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  )
}

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    const mockAddToCart = vi.fn()
    
    renderWithRouter(
      <ProductCard product={mockProduct} onAddToCart={mockAddToCart} />
    )

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$99.99')).toBeInTheDocument()
    expect(screen.getByText('10 in stock')).toBeInTheDocument()
    expect(screen.getByText('test')).toBeInTheDocument()
    expect(screen.getByText('electronics')).toBeInTheDocument()
  })

  it('calls onAddToCart when add to cart button is clicked', () => {
    const mockAddToCart = vi.fn()
    
    renderWithRouter(
      <ProductCard product={mockProduct} onAddToCart={mockAddToCart} />
    )

    const addToCartButton = screen.getByText('Add to Cart')
    fireEvent.click(addToCartButton)

    expect(mockAddToCart).toHaveBeenCalledTimes(1)
  })

  it('shows out of stock state when stockQty is 0', () => {
    const outOfStockProduct = { ...mockProduct, stockQty: 0 }
    const mockAddToCart = vi.fn()
    
    renderWithRouter(
      <ProductCard product={outOfStockProduct} onAddToCart={mockAddToCart} />
    )

    expect(screen.getByText('Out of stock')).toBeInTheDocument()
    expect(screen.getByText('Unavailable')).toBeInTheDocument()
    
    const button = screen.getByText('Unavailable')
    expect(button).toBeDisabled()
  })

  it('has proper accessibility attributes', () => {
    const mockAddToCart = vi.fn()
    
    renderWithRouter(
      <ProductCard product={mockProduct} onAddToCart={mockAddToCart} />
    )

    const image = screen.getByAltText('Test Product')
    expect(image).toBeInTheDocument()
    
    const addToCartButton = screen.getByText('Add to Cart')
    expect(addToCartButton).toBeInTheDocument()
  })
})
