import type { Meta, StoryObj } from '@storybook/react'
import Button from '../components/atoms/Button'

const meta: Meta<typeof Button> = {
  title: 'Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    onClick: { action: 'clicked' },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
    size: 'md',
  },
}

export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
    size: 'md',
  },
}

export const Small: Story = {
  args: {
    children: 'Small',
    variant: 'primary',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large',
    variant: 'primary',
    size: 'lg',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    size: 'md',
    disabled: true,
  },
}
