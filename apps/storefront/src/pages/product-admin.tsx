import { useState, useEffect } from 'react'
import { formatCurrency } from '../lib/format'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

interface Product {
  _id?: string
  name: string
  price: number
  category: string
  stock: number
  description: string
  imageUrl?: string
}

interface Stats {
  products: { total: number; byCategory: any; lowStock: number }
  customers: { total: number; newThisWeek: number }
  orders: { total: number; byStatus: any; revenue: number }
}

export default function ProductAdmin() {
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<Product>({
    name: '',
    price: 0,
    category: 'electronics',
    stock: 0,
    description: ''
  })

  useEffect(() => {
    loadProducts()
    loadStats()
  }, [])

  const loadProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`)
      const data = await response.json()
      setProducts(data.products || data)
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/business-metrics`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingProduct 
      ? `${API_BASE_URL}/api/products/${editingProduct._id}`
      : `${API_BASE_URL}/api/products`
    
    const method = editingProduct ? 'PUT' : 'POST'
    
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        loadProducts()
        loadStats()
        setShowForm(false)
        setEditingProduct(null)
        setFormData({
          name: '',
          price: 0,
          category: 'electronics',
          stock: 0,
          description: ''
        })
      }
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          loadProducts()
          loadStats()
        }
      } catch (error) {
        console.error('Failed to delete product:', error)
      }
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData(product)
    setShowForm(true)
  }

  const handleResetData = async () => {
    if (confirm('⚠️ This will reset ALL data to defaults. Are you sure?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ confirm: 'RESET_ALL_DATA' })
        })
        if (response.ok) {
          loadProducts()
          loadStats()
          alert('✅ Data reset to defaults')
        }
      } catch (error) {
        console.error('Failed to reset data:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Administration</h1>
          <p className="text-gray-600 mt-2">Manage your products and view statistics</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleResetData}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            🔄 Reset All Data
          </button>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingProduct(null)
              setFormData({
                name: '',
                price: 0,
                category: 'electronics',
                stock: 0,
                description: ''
              })
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            ➕ Add Product
          </button>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📦 Products</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats.products.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Low Stock:</span>
                <span className="font-bold text-red-600">{stats.products.lowStock}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-sm text-gray-500">By Category:</div>
                {Object.entries(stats.products.byCategory).map(([cat, count]) => (
                  <div key={cat} className="flex justify-between text-sm">
                    <span className="capitalize">{cat}:</span>
                    <span>{count as number}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">👥 Customers</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats.customers.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">New This Week:</span>
                <span className="font-bold text-green-600">{stats.customers.newThisWeek}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 Orders</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-bold">{stats.orders.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue:</span>
                <span className="font-bold text-green-600">{formatCurrency(stats.orders.revenue)}</span>
              </div>
              {Object.entries(stats.orders.byStatus || {}).length > 0 && (
                <div className="pt-2 border-t">
                  <div className="text-sm text-gray-500">By Status:</div>
                  {Object.entries(stats.orders.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between text-sm">
                      <span>{status}:</span>
                      <span>{count as number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="electronics">Electronics</option>
                  <option value="home">Home</option>
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                  <option value="books">Books</option>
                  <option value="sports">Sports</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              >
                {editingProduct ? 'Update' : 'Create'} Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingProduct(null)
                }}
                className="px-6 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.description}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(product)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product._id!)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
