import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProduct, listProducts } from '../lib/api'
import { useCart } from '../lib/store'
import { formatCurrency } from '../lib/format'
import type { Product } from '../types'
import ProductCard from '../components/molecules/ProductCard'

export default function ProductPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  const addToCart = useCart(state => state.add)

  useEffect(() => {
    if (id) {
      loadProduct(id)
    }
  }, [id])

  const loadProduct = async (productId: string) => {
    try {
      setLoading(true)
      const [productData, allProducts] = await Promise.all([
        getProduct(productId),
        listProducts()
      ])
      
      if (productData) {
        setProduct(productData)
        
        // Find related products by shared tags
        const related = allProducts
          .filter(p => p.id !== productId && p.tags.some(tag => productData.tags.includes(tag)))
          .slice(0, 3)
        setRelatedProducts(related)
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">❌</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Back to Catalog
        </Link>
      </div>
    )
  }

  const isOutOfStock = product.stockQty === 0

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm">
        <Link to="/" className="text-primary-600 hover:text-primary-700">
          Catalog
        </Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-600">{product.title}</span>
      </nav>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
            <p className="text-3xl font-bold text-primary-600 mb-4">
              {formatCurrency(product.price)}
            </p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className={`font-medium ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stockQty} in Stock`}
                </span>
              </div>
            </div>
          </div>

          {product.description && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`w-full py-3 px-6 text-lg font-medium rounded-lg transition-colors ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedProducts.map(relatedProduct => (
              <ProductCard
                key={relatedProduct.id}
                product={relatedProduct}
                onAddToCart={() => addToCart(relatedProduct)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
