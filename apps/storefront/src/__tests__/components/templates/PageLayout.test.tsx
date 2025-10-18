import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageLayout from '../../../components/templates/PageLayout'

describe('PageLayout', () => {
  it('renders children', () => {
    render(
      <PageLayout>
        <div>Test content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <PageLayout title="Test Title">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(
      <PageLayout subtitle="Test Subtitle">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument()
  })

  it('renders both title and subtitle', () => {
    render(
      <PageLayout title="Main Title" subtitle="Subtitle Text">
        <div>Content</div>
      </PageLayout>
    )
    expect(screen.getByText('Main Title')).toBeInTheDocument()
    expect(screen.getByText('Subtitle Text')).toBeInTheDocument()
  })

  it('does not render header section when no title or subtitle', () => {
    const { container } = render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>
    )
    expect(container.querySelector('.text-center')).not.toBeInTheDocument()
  })

  it('applies correct title styling', () => {
    render(
      <PageLayout title="Title">
        <div>Content</div>
      </PageLayout>
    )
    const title = screen.getByText('Title')
    expect(title.tagName).toBe('H1')
    expect(title.className).toContain('text-3xl')
    expect(title.className).toContain('font-bold')
  })

  it('applies correct subtitle styling', () => {
    render(
      <PageLayout subtitle="Subtitle">
        <div>Content</div>
      </PageLayout>
    )
    const subtitle = screen.getByText('Subtitle')
    expect(subtitle.tagName).toBe('P')
    expect(subtitle.className).toContain('text-gray-600')
  })
})
