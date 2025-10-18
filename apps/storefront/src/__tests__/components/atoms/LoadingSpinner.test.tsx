import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '../../../components/atoms/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders spinner element', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('applies medium size by default', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.querySelector('.h-8.w-8')
    expect(spinner).toBeInTheDocument()
  })

  it('applies small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const spinner = container.querySelector('.h-4.w-4')
    expect(spinner).toBeInTheDocument()
  })

  it('applies large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('.h-12.w-12')
    expect(spinner).toBeInTheDocument()
  })

  it('accepts custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    const spinner = container.querySelector('.custom-class')
    expect(spinner).toBeInTheDocument()
  })

  it('has spinner animation class', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.firstChild
    expect(spinner).toHaveClass('animate-spin')
  })

  it('has border styling', () => {
    const { container } = render(<LoadingSpinner />)
    const spinner = container.firstChild
    expect(spinner).toHaveClass('rounded-full')
    expect(spinner).toHaveClass('border-b-2')
  })
})
