import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Input from '../../../components/atoms/Input'

describe('Input', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders label when provided', () => {
    render(<Input label="Username" />)
    expect(screen.getByText('Username')).toBeInTheDocument()
  })

  it('does not render label when not provided', () => {
    render(<Input />)
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('displays error message when provided', () => {
    render(<Input error="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('applies error styling when error is provided', () => {
    render(<Input error="Error" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('border-red-300')
  })

  it('handles input changes', () => {
    const handleChange = vi.fn()
    render(<Input onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'test value' } })
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('accepts custom className', () => {
    render(<Input className="custom-class" data-testid="input" />)
    const input = screen.getByTestId('input')
    expect(input.className).toContain('custom-class')
  })

  it('forwards HTML input attributes', () => {
    render(<Input type="email" required aria-label="Email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('required')
    expect(input).toHaveAttribute('aria-label', 'Email')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('supports default value', () => {
    render(<Input defaultValue="Default text" />)
    const input = screen.getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Default text')
  })
})
