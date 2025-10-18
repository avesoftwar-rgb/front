import type { Meta, StoryObj } from '@storybook/react'
import ProductCard from '../components/molecules/ProductCard'
import type { Product } from '../types'

const meta: Meta<typeof ProductCard> = {
  title: 'Molecules/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    onAddToCart: { action: 'addToCart' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const sampleProduct: Product = {
  id: 'PROD001',
  title: 'Wireless Bluetooth Headphones',
  price: 79.99,
  image: '/logo.svg',
  tags: ['audio', 'wireless', 'electronics'],
  stockQty: 15,
  description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.'
}

export const Default: Story = {
  args: {
    product: sampleProduct,
    onAddToCart: () => console.log('Add to cart clicked'),
  },
}

export const OutOfStock: Story = {
  args: {
    product: { ...sampleProduct, stockQty: 0 },
    onAddToCart: () => console.log('Add to cart clicked'),
  },
}

export const LowStock: Story = {
  args: {
    product: { ...sampleProduct, stockQty: 2 },
    onAddToCart: () => console.log('Add to cart clicked'),
  },
}

export const HighPrice: Story = {
  args: {
    product: { ...sampleProduct, price: 299.99 },
    onAddToCart: () => console.log('Add to cart clicked'),
  },
}
