import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const addToCart = useCart(state => state.add)

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      const products = await listProducts()
      setFeaturedProducts(products.slice(0, 8))
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: '🔒', title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: '↩️', title: 'Easy Returns', desc: '30-day return policy' },
    { icon: '💬', title: '24/7 Support', desc: 'Chat with Alex anytime' }
  ]

  const categories = [
    { name: 'Electronics', icon: '💻', color: 'bg-blue-500' },
    { name: 'Home', icon: '🏠', color: 'bg-green-500' },
    { name: 'Apparel', icon: '👕', color: 'bg-purple-500' },
    { name: 'Accessories', icon: '👜', color: 'bg-pink-500' }
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to ShopSmart
            </h1>
            <p className="text-xl lg:text-2xl mb-8 opacity-90">
              Discover amazing products at unbeatable prices
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                to="/catalog"
                className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
              >
                Shop Now →
              </Link>
              <Link 
                to="/admin/products"
                className="px-8 py-3 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Manage Products
              </Link>
            </div>
          </div>
        </div>
        
        {/* Animated Background Elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white opacity-10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-bounce"></div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, idx) => (
          <div 
            key={idx}
            className="bg-white rounded-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer transform hover:-translate-y-1"
          >
            <div className="text-4xl mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, idx) => (
            <Link
              key={idx}
              to={`/catalog?category=${category.name.toLowerCase()}`}
              className="group"
            >
              <div className={`${category.color} rounded-lg p-8 text-white text-center hover:shadow-xl transition-all transform group-hover:scale-105`}>
                <div className="text-5xl mb-4">{category.icon}</div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link to="/catalog" className="text-blue-600 hover:text-blue-700 font-medium">
            View All →
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
              <div 
                key={product.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all group"
              >
                <Link to={`/p/${product.id}`}>
                  <div className="aspect-w-1 aspect-h-1 bg-gray-200 rounded-t-lg overflow-hidden">
                    <img 
                      src={product.image || '/placeholder.jpg'} 
                      alt={product.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
                    {product.title}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-blue-600">
                      {formatCurrency(product.price)}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-8 lg:p-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated!</h2>
          <p className="mb-6 opacity-90">
            Subscribe to get special offers, free giveaways, and amazing deals!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div>
          <div className="text-3xl font-bold text-blue-600 mb-2">10K+</div>
          <div className="text-gray-600">Happy Customers</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-green-600 mb-2">5K+</div>
          <div className="text-gray-600">Products</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
          <div className="text-gray-600">Brands</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-pink-600 mb-2">24/7</div>
          <div className="text-gray-600">Support</div>
        </div>
      </section>
    </div>
  )
}
