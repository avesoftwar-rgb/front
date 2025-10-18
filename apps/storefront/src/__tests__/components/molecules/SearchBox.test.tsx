import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchBox from '../../../components/molecules/SearchBox'

describe('SearchBox', () => {
  it('renders search input with placeholder', () => {
    render(
      <SearchBox
        value=""
        onChange={vi.fn()}
        placeholder="Search products..."
      />
    )

    const input = screen.getByPlaceholderText('Search products...')
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('type', 'text')
  })

  it('displays current value', () => {
    render(
      <SearchBox
        value="test search"
        onChange={vi.fn()}
        placeholder="Search..."
      />
    )

    const input = screen.getByDisplayValue('test search')
    expect(input).toBeInTheDocument()
  })

  it('calls onChange when typing', () => {
    const onChange = vi.fn()
    render(
      <SearchBox
        value=""
        onChange={onChange}
        placeholder="Search..."
      />
    )

    const input = screen.getByPlaceholderText('Search...')
    fireEvent.change(input, { target: { value: 'new search' } })
    expect(onChange).toHaveBeenCalledWith('new search')
  })

  it('has proper label for accessibility', () => {
    render(
      <SearchBox
        value=""
        onChange={vi.fn()}
        placeholder="Search products..."
      />
    )

    const label = screen.getByLabelText(/search/i)
    expect(label).toBeInTheDocument()
  })

  it('shows search icon', () => {
    const { container } = render(
      <SearchBox
        value=""
        onChange={vi.fn()}
        placeholder="Search..."
      />
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })

  it('applies focus styles', () => {
    render(
      <SearchBox
        value=""
        onChange={vi.fn()}
        placeholder="Search..."
      />
    )

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveClass('focus:ring-2')
    expect(input).toHaveClass('focus:ring-primary-500')
  })

  it('has proper input styling', () => {
    render(
      <SearchBox
        value=""
        onChange={vi.fn()}
        placeholder="Search..."
      />
    )

    const input = screen.getByPlaceholderText('Search...')
    expect(input).toHaveClass('input-field')
    expect(input).toHaveClass('pl-10') // Padding for icon
  })

  it('handles empty value', () => {
    const onChange = vi.fn()
    render(
      <SearchBox
        value="test"
        onChange={onChange}
        placeholder="Search..."
      />
    )

    const input = screen.getByDisplayValue('test')
    fireEvent.change(input, { target: { value: '' } })
    expect(onChange).toHaveBeenCalledWith('')
  })
})
