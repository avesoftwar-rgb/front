import type { Meta, StoryObj } from '@storybook/react'
import LoadingSpinner from '../components/atoms/LoadingSpinner'

const meta: Meta<typeof LoadingSpinner> = {
  title: 'Atoms/LoadingSpinner',
  component: LoadingSpinner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'white', 'gray'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    color: 'primary',
  },
}

export const Medium: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    color: 'primary',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
    color: 'primary',
  },
}

export const PrimaryColor: Story = {
  args: {
    size: 'md',
    color: 'primary',
  },
}

export const SecondaryColor: Story = {
  args: {
    size: 'md',
    color: 'secondary',
  },
}

export const WhiteColor: Story = {
  args: {
    size: 'md',
    color: 'white',
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-800 p-8 rounded-lg">
        <Story />
      </div>
    ),
  ],
}

export const GrayColor: Story = {
  args: {
    size: 'md',
    color: 'gray',
  },
}

export const InButton: Story = {
  render: () => (
    <button className="btn-primary flex items-center space-x-2" disabled>
      <LoadingSpinner size="sm" color="white" />
      <span>Loading...</span>
    </button>
  ),
}

export const InCard: Story = {
  render: () => (
    <div className="card w-64 h-32 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" color="primary" />
        <p className="mt-4 text-sm text-gray-600">Loading products...</p>
      </div>
    </div>
  ),
}

export const FullPage: Story = {
  render: () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" />
        <p className="mt-6 text-lg text-gray-700">Please wait...</p>
      </div>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <div className="text-center">
        <LoadingSpinner size="sm" color="primary" />
        <p className="mt-2 text-xs">Small</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="md" color="primary" />
        <p className="mt-2 text-xs">Medium</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="lg" color="primary" />
        <p className="mt-2 text-xs">Large</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="xl" color="primary" />
        <p className="mt-2 text-xs">Extra Large</p>
      </div>
    </div>
  ),
}

export const AllColors: Story = {
  render: () => (
    <div className="flex items-center space-x-8">
      <div className="text-center">
        <LoadingSpinner size="md" color="primary" />
        <p className="mt-2 text-xs">Primary</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="md" color="secondary" />
        <p className="mt-2 text-xs">Secondary</p>
      </div>
      <div className="text-center bg-gray-800 p-4 rounded">
        <LoadingSpinner size="md" color="white" />
        <p className="mt-2 text-xs text-white">White</p>
      </div>
      <div className="text-center">
        <LoadingSpinner size="md" color="gray" />
        <p className="mt-2 text-xs">Gray</p>
      </div>
    </div>
  ),
}
