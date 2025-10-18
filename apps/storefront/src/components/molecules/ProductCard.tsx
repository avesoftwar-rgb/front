import { Link } from 'react-router-dom'
import { formatCurrency } from '../../lib/format'
import LazyImage from '../atoms/LazyImage'
import type { Product } from '../../types'

interface ProductCardProps {
  product: Product
  onAddToCart: () => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stockQty === 0

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <Link to={`/p/${product.id}`} className="block">
        <div className="aspect-square rounded-lg mb-4 overflow-hidden">
          <LazyImage
            src={product.image}
            alt={product.title}
            className="w-full h-full"
          />
        </div>
      </Link>
      
      <div className="space-y-3">
        <div>
          <Link to={`/p/${product.id}`} className="block">
            <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
              {product.title}
            </h3>
          </Link>
          <p className="text-lg font-bold text-primary-600 mt-1">
            {formatCurrency(product.price)}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={`text-sm ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {isOutOfStock ? 'Out of stock' : `${product.stockQty} in stock`}
            </span>
          </div>
          
          <button
            onClick={onAddToCart}
            disabled={isOutOfStock}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'btn-primary'
            }`}
          >
            {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
