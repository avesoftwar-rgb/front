import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import LazyImage from '../../../components/atoms/LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
})
window.IntersectionObserver = mockIntersectionObserver

describe('LazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders placeholder initially', () => {
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        className="test-class"
      />
    )

    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument()
  })

  it('loads image when in view', async () => {
    const observeCallback = vi.fn()
    mockIntersectionObserver.mockImplementation((callback) => {
      observeCallback.mockImplementation(callback)
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
    })

    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    // Simulate intersection
    observeCallback([{ isIntersecting: true }])

    await waitFor(() => {
      const img = screen.getByAltText('Test image')
      expect(img).toHaveAttribute('src', '/test.jpg')
      expect(img).toHaveAttribute('loading', 'lazy')
    })
  })

  it('applies custom className', () => {
    const { container } = render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        className="custom-class"
      />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows custom placeholder', () => {
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
        placeholder={<div>Loading...</div>}
      />
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows default placeholder icon when no custom placeholder', () => {
    const { container } = render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('disconnects observer on unmount', () => {
    const disconnect = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect
    })

    const { unmount } = render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    unmount()
    expect(disconnect).toHaveBeenCalled()
  })

  it('handles image load event', async () => {
    const observeCallback = vi.fn()
    mockIntersectionObserver.mockImplementation((callback) => {
      observeCallback.mockImplementation(callback)
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn()
      }
    })

    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    // Simulate intersection
    observeCallback([{ isIntersecting: true }])

    await waitFor(() => {
      const img = screen.getByAltText('Test image')
      expect(img).toBeInTheDocument()
    })

    // Simulate load event
    const img = screen.getByAltText('Test image')
    img.dispatchEvent(new Event('load'))

    expect(img).toHaveClass('opacity-100')
  })

  it('sets threshold for IntersectionObserver', () => {
    render(
      <LazyImage
        src="/test.jpg"
        alt="Test image"
      />
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ threshold: 0.1 })
    )
  })
})
