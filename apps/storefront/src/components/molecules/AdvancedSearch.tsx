import { useState } from 'react'

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void
  categories: string[]
}

export interface SearchFilters {
  query: string
  category: string
  minPrice: number
  maxPrice: number
  inStock: boolean
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'newest'
}

export default function AdvancedSearch({ onSearch, categories }: AdvancedSearchProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    inStock: false,
    sortBy: 'name'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      query: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000,
      inStock: false,
      sortBy: 'name' as const
    }
    setFilters(defaultFilters)
    onSearch(defaultFilters)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleSubmit}>
        {/* Main Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={filters.query}
              onChange={(e) => setFilters({...filters, query: e.target.value})}
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Search
          </button>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="border-t pt-4 space-y-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({...filters, sortBy: e.target.value as any})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                </select>
              </div>

              {/* In Stock Only */}
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => setFilters({...filters, inStock: e.target.checked})}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">In Stock Only</span>
                </label>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50 transition"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
