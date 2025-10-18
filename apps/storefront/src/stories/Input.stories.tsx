import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import Input from '../components/atoms/Input'

const meta: Meta<typeof Input> = {
  title: 'Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
    },
    placeholder: { control: 'text' },
    value: { control: 'text' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    label: { control: 'text' },
    error: { control: 'text' },
    onChange: { action: 'changed' },
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    type: 'text',
    placeholder: 'Enter text...',
    label: 'Input Label',
  },
}

export const WithValue: Story = {
  args: {
    type: 'text',
    value: 'Sample text',
    label: 'Input with Value',
  },
}

export const Required: Story = {
  args: {
    type: 'text',
    placeholder: 'This field is required',
    label: 'Required Field',
    required: true,
  },
}

export const Disabled: Story = {
  args: {
    type: 'text',
    value: 'Disabled input',
    label: 'Disabled Field',
    disabled: true,
  },
}

export const WithError: Story = {
  args: {
    type: 'email',
    value: 'invalid-email',
    label: 'Email',
    error: 'Please enter a valid email address',
  },
}

export const EmailInput: Story = {
  args: {
    type: 'email',
    placeholder: 'user@example.com',
    label: 'Email Address',
  },
}

export const PasswordInput: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
    label: 'Password',
  },
}

export const NumberInput: Story = {
  args: {
    type: 'number',
    placeholder: '0',
    label: 'Quantity',
    min: 0,
    max: 100,
  },
}

export const TelephoneInput: Story = {
  args: {
    type: 'tel',
    placeholder: '+1 (555) 123-4567',
    label: 'Phone Number',
  },
}

export const URLInput: Story = {
  args: {
    type: 'url',
    placeholder: 'https://example.com',
    label: 'Website URL',
  },
}

export const Interactive: Story = {
  render: () => {
    const [value, setValue] = useState('')
    const [error, setError] = useState('')
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
      if (e.target.value.length < 3) {
        setError('Must be at least 3 characters')
      } else {
        setError('')
      }
    }
    
    return (
      <div className="space-y-4">
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Type at least 3 characters..."
          label="Interactive Input"
          error={error}
        />
        <div className="text-sm text-gray-600">
          Current value: {value || '(empty)'}
        </div>
      </div>
    )
  },
}

export const FormExample: Story = {
  render: () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: '',
    })
    
    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [field]: e.target.value }))
    }
    
    return (
      <div className="card p-6 space-y-4 w-96">
        <h3 className="text-lg font-semibold">Sign Up Form</h3>
        <Input
          type="text"
          value={formData.name}
          onChange={handleChange('name')}
          placeholder="John Doe"
          label="Full Name"
          required
        />
        <Input
          type="email"
          value={formData.email}
          onChange={handleChange('email')}
          placeholder="john@example.com"
          label="Email Address"
          required
        />
        <Input
          type="password"
          value={formData.password}
          onChange={handleChange('password')}
          placeholder="••••••••"
          label="Password"
          required
        />
        <button className="btn-primary w-full">Sign Up</button>
      </div>
    )
  },
}

export const ValidationStates: Story = {
  render: () => (
    <div className="space-y-4">
      <Input
        type="text"
        value=""
        placeholder="Empty state"
        label="Default"
      />
      <Input
        type="text"
        value="Valid input"
        placeholder="Valid state"
        label="Valid"
        className="border-green-500 focus:border-green-600"
      />
      <Input
        type="text"
        value="Invalid input"
        placeholder="Invalid state"
        label="Invalid"
        error="This field has an error"
      />
      <Input
        type="text"
        value="Disabled state"
        placeholder="Disabled"
        label="Disabled"
        disabled
      />
    </div>
  ),
}
