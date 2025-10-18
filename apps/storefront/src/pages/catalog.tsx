import { useState, useEffect } from 'react'
import { listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import type { Product } from '../types'
import ProductCard from '../components/molecules/ProductCard'
import SearchBox from '../components/molecules/SearchBox'
import TagFilter from '../components/molecules/TagFilter'

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name'>('name')
  
  const addToCart = useCart(state => state.add)

  useEffect(() => {
    loadProducts()
  }, [])

  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchTerm, selectedTag, sortBy])

  const loadProducts = async () => {
    try {
      const data = await listProducts()
      setProducts(data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortProducts = () => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchLower) ||
        (product.tags && product.tags.some(tag => tag && tag.toLowerCase().includes(searchLower)))
      )
    }

    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter(product =>
        product.tags && product.tags.includes(selectedTag)
      )
    }

    // Sort products
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'name':
        default:
          return a.title.localeCompare(b.title)
      }
    })

    setFilteredProducts(filtered)
  }

  const getAllTags = () => {
    const allTags = products.flatMap(p => p.tags || [])
    return Array.from(new Set(allTags.filter(tag => tag && typeof tag === 'string')))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
        <p className="text-gray-600">Discover our amazing collection of products</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search products..."
          />
          
          <TagFilter
            tags={getAllTags()}
            selectedTag={selectedTag}
            onTagChange={setSelectedTag}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="input-field"
            >
              <option value="name">Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredProducts.length} of {products.length} products
          {selectedTag && ` in "${selectedTag}"`}
        </p>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
