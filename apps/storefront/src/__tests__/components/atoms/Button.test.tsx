import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '../../../components/atoms/Button'

describe('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('applies primary variant by default', () => {
    render(<Button>Primary</Button>)
    const button = screen.getByText('Primary')
    expect(button.className).toContain('bg-primary-600')
  })

  it('applies secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByText('Secondary')
    expect(button.className).toContain('bg-gray-600')
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByText('Outline')
    expect(button.className).toContain('border')
  })

  it('applies small size', () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByText('Small')
    expect(button.className).toContain('px-3')
    expect(button.className).toContain('py-1.5')
  })

  it('applies medium size by default', () => {
    render(<Button>Medium</Button>)
    const button = screen.getByText('Medium')
    expect(button.className).toContain('px-4')
    expect(button.className).toContain('py-2')
  })

  it('applies large size', () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByText('Large')
    expect(button.className).toContain('px-6')
    expect(button.className).toContain('py-3')
  })

  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    
    fireEvent.click(screen.getByText('Click'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick} disabled>Disabled</Button>)
    
    const button = screen.getByText('Disabled')
    expect(button).toBeDisabled()
    
    fireEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('accepts custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByText('Custom')
    expect(button.className).toContain('custom-class')
  })

  it('forwards other HTML button attributes', () => {
    render(<Button type="submit" aria-label="Submit form">Submit</Button>)
    const button = screen.getByText('Submit')
    expect(button).toHaveAttribute('type', 'submit')
    expect(button).toHaveAttribute('aria-label', 'Submit form')
  })
})
