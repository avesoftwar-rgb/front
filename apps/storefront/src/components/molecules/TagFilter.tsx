import React from 'react'

interface TagFilterProps {
  tags: string[]
  selectedTag: string
  onTagChange: (tag: string) => void
  className?: string
}

export default function TagFilter({ 
  tags, 
  selectedTag, 
  onTagChange,
  className = ''
}: TagFilterProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Filter by Category
      </label>
      <select
        value={selectedTag}
        onChange={(e) => onTagChange(e.target.value)}
        className="input-field"
      >
        <option value="">All Categories</option>
        {tags.filter(tag => tag && typeof tag === 'string').map(tag => (
          <option key={tag} value={tag}>
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </option>
        ))}
      </select>
    </div>
  )
}
