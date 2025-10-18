import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import SearchBox from '../components/molecules/SearchBox'

const meta: Meta<typeof SearchBox> = {
  title: 'Molecules/SearchBox',
  component: SearchBox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    value: { control: 'text' },
    placeholder: { control: 'text' },
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
    value: '',
    placeholder: 'Search products...',
  },
}

export const WithValue: Story = {
  args: {
    value: 'wireless headphones',
    placeholder: 'Search products...',
  },
}

export const CustomPlaceholder: Story = {
  args: {
    value: '',
    placeholder: 'Type to search...',
  },
}

export const Interactive: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    
    return (
      <div className="space-y-4">
        <SearchBox
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search products..."
        />
        <div className="text-sm text-gray-600">
          Current search: {searchValue || '(empty)'}
        </div>
      </div>
    )
  },
}

export const ProductSearch: Story = {
  args: {
    value: '',
    placeholder: 'Search by product name or tag...',
  },
}

export const Disabled: Story = {
  args: {
    value: '',
    placeholder: 'Search disabled',
  },
  render: (args) => (
    <div className="opacity-50 pointer-events-none">
      <SearchBox {...args} />
    </div>
  ),
}

export const WithResults: Story = {
  render: () => {
    const [searchValue, setSearchValue] = useState('')
    const mockProducts = [
      'Wireless Headphones',
      'Bluetooth Speaker',
      'USB Cable',
      'Gaming Mouse',
      'Mechanical Keyboard',
    ]
    
    const filtered = mockProducts.filter(p => 
      p.toLowerCase().includes(searchValue.toLowerCase())
    )
    
    return (
      <div className="w-96 space-y-4">
        <SearchBox
          value={searchValue}
          onChange={setSearchValue}
          placeholder="Search products..."
        />
        {searchValue && (
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Results ({filtered.length})</h3>
            {filtered.length > 0 ? (
              <ul className="space-y-1">
                {filtered.map((product) => (
                  <li key={product} className="text-sm">{product}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No results found</p>
            )}
          </div>
        )}
      </div>
    )
  },
}

export const DarkMode: Story = {
  args: {
    value: '',
    placeholder: 'Search in dark mode...',
  },
  decorators: [
    (Story) => (
      <div className="bg-gray-900 p-8 rounded-lg">
        <div className="dark">
          <Story />
        </div>
      </div>
    ),
  ],
}
