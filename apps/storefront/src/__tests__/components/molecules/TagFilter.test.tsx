import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import TagFilter from '../../../components/molecules/TagFilter'

describe('TagFilter', () => {
  const mockTags = ['electronics', 'audio', 'wireless', 'gaming']

  it('renders tag filter dropdown', () => {
    render(
      <TagFilter
        tags={mockTags}
        selectedTag=""
        onTagChange={vi.fn()}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    expect(select).toBeInTheDocument()
  })

  it('displays all tags as options', () => {
    render(
      <TagFilter
        tags={mockTags}
        selectedTag=""
        onTagChange={vi.fn()}
      />
    )

    expect(screen.getByText('All Tags')).toBeInTheDocument()
    mockTags.forEach(tag => {
      expect(screen.getByRole('option', { name: tag })).toBeInTheDocument()
    })
  })

  it('shows selected tag', () => {
    render(
      <TagFilter
        tags={mockTags}
        selectedTag="audio"
        onTagChange={vi.fn()}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    expect(select).toHaveValue('audio')
  })

  it('calls onTagChange when selection changes', () => {
    const onTagChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedTag=""
        onTagChange={onTagChange}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    fireEvent.change(select, { target: { value: 'electronics' } })
    expect(onTagChange).toHaveBeenCalledWith('electronics')
  })

  it('allows clearing selection', () => {
    const onTagChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedTag="audio"
        onTagChange={onTagChange}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    fireEvent.change(select, { target: { value: '' } })
    expect(onTagChange).toHaveBeenCalledWith('')
  })

  it('handles empty tags array', () => {
    render(
      <TagFilter
        tags={[]}
        selectedTag=""
        onTagChange={vi.fn()}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    expect(select).toBeInTheDocument()
    expect(screen.getByText('All Tags')).toBeInTheDocument()
  })

  it('has proper label for accessibility', () => {
    render(
      <TagFilter
        tags={mockTags}
        selectedTag=""
        onTagChange={vi.fn()}
      />
    )

    const label = screen.getByText('Filter by Tag')
    expect(label).toBeInTheDocument()
    expect(label).toHaveClass('text-sm', 'font-medium')
  })

  it('applies proper styling to select element', () => {
    render(
      <TagFilter
        tags={mockTags}
        selectedTag=""
        onTagChange={vi.fn()}
      />
    )

    const select = screen.getByLabelText(/filter by tag/i)
    expect(select).toHaveClass('input-field')
  })

  it('maintains selection after re-render', () => {
    const { rerender } = render(
      <TagFilter
        tags={mockTags}
        selectedTag="gaming"
        onTagChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/filter by tag/i)).toHaveValue('gaming')

    rerender(
      <TagFilter
        tags={mockTags}
        selectedTag="gaming"
        onTagChange={vi.fn()}
      />
    )

    expect(screen.getByLabelText(/filter by tag/i)).toHaveValue('gaming')
  })
})
