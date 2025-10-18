import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import TagFilter from '../components/molecules/TagFilter'

const meta: Meta<typeof TagFilter> = {
  title: 'Molecules/TagFilter',
  component: TagFilter,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    tags: { control: 'object' },
    selectedTag: { control: 'text' },
    onTagChange: { action: 'tag changed' },
  },
  decorators: [
    (Story) => (
      <div className="w-64">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

const defaultTags = ['electronics', 'audio', 'wireless', 'gaming', 'accessories', 'cables', 'portable']

export const Default: Story = {
  args: {
    tags: defaultTags,
    selectedTag: '',
  },
}

export const WithSelection: Story = {
  args: {
    tags: defaultTags,
    selectedTag: 'audio',
  },
}

export const FewTags: Story = {
  args: {
    tags: ['electronics', 'audio'],
    selectedTag: '',
  },
}

export const ManyTags: Story = {
  args: {
    tags: [
      'electronics',
      'audio',
      'wireless',
      'gaming',
      'accessories',
      'cables',
      'portable',
      'smart',
      'office',
      'laptop',
      'mobile',
      'tablet',
      'wearables',
      'fitness',
      'charging',
    ],
    selectedTag: '',
  },
}

export const Interactive: Story = {
  render: () => {
    const [selectedTag, setSelectedTag] = useState('')
    
    return (
      <div className="space-y-4">
        <TagFilter
          tags={defaultTags}
          selectedTag={selectedTag}
          onTagChange={setSelectedTag}
        />
        <div className="text-sm text-gray-600">
          Selected tag: {selectedTag || 'All Tags'}
        </div>
      </div>
    )
  },
}

export const ProductCategories: Story = {
  args: {
    tags: ['headphones', 'speakers', 'earbuds', 'microphones', 'amplifiers'],
    selectedTag: '',
  },
}

export const EmptyTags: Story = {
  args: {
    tags: [],
    selectedTag: '',
  },
}

export const SingleTag: Story = {
  args: {
    tags: ['electronics'],
    selectedTag: '',
  },
}

export const WithProductCount: Story = {
  render: () => {
    const [selectedTag, setSelectedTag] = useState('')
    const tagsWithCount = [
      { name: 'electronics', count: 12 },
      { name: 'audio', count: 8 },
      { name: 'wireless', count: 15 },
      { name: 'gaming', count: 6 },
      { name: 'accessories', count: 20 },
    ]
    
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Tag
          </label>
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="input-field"
          >
            <option value="">All Tags</option>
            {tagsWithCount.map(tag => (
              <option key={tag.name} value={tag.name}>
                {tag.name} ({tag.count})
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-600">
          {selectedTag ? (
            <>
              Showing products with tag: <span className="font-semibold">{selectedTag}</span>
            </>
          ) : (
            'Showing all products'
          )}
        </div>
      </div>
    )
  },
}

export const InForm: Story = {
  render: () => {
    const [selectedTag, setSelectedTag] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
        <h3 className="font-semibold text-lg">Filter Products</h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="input-field"
            />
          </div>
          <TagFilter
            tags={defaultTags}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />
        </div>
        <div className="pt-4 border-t text-sm text-gray-600">
          <div>Search: {searchTerm || '(empty)'}</div>
          <div>Tag: {selectedTag || 'All Tags'}</div>
        </div>
      </div>
    )
  },
}
