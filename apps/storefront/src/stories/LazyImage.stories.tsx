import type { Meta, StoryObj } from '@storybook/react'
import LazyImage from '../components/atoms/LazyImage'

const meta: Meta<typeof LazyImage> = {
  title: 'Atoms/LazyImage',
  component: LazyImage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: { control: 'text' },
    alt: { control: 'text' },
    className: { control: 'text' },
    placeholder: { control: false },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    src: 'https://via.placeholder.com/400x300',
    alt: 'Placeholder image',
    className: 'w-96 h-72 rounded-lg',
  },
}

export const WithCustomPlaceholder: Story = {
  args: {
    src: 'https://via.placeholder.com/400x300',
    alt: 'Image with custom placeholder',
    className: 'w-96 h-72 rounded-lg',
    placeholder: <div className="text-center p-4">Loading image...</div>,
  },
}

export const SmallImage: Story = {
  args: {
    src: 'https://via.placeholder.com/150',
    alt: 'Small image',
    className: 'w-32 h-32 rounded-full',
  },
}

export const LargeImage: Story = {
  args: {
    src: 'https://via.placeholder.com/800x600',
    alt: 'Large image',
    className: 'w-full max-w-4xl h-auto rounded-lg',
  },
}

export const ProductImage: Story = {
  args: {
    src: '/logo.svg',
    alt: 'Product image',
    className: 'w-64 h-64 rounded-lg shadow-md',
  },
}

export const BannerImage: Story = {
  args: {
    src: 'https://via.placeholder.com/1920x480',
    alt: 'Banner image',
    className: 'w-full h-48 md:h-64 lg:h-80 object-cover',
  },
}

export const ThumbnailImage: Story = {
  args: {
    src: 'https://via.placeholder.com/100',
    alt: 'Thumbnail',
    className: 'w-20 h-20 rounded-md',
  },
}

export const ErrorFallback: Story = {
  args: {
    src: 'https://invalid-url.com/image.jpg',
    alt: 'Image that fails to load',
    className: 'w-96 h-72 rounded-lg',
  },
}
