import { Routes, Route, Link } from 'react-router-dom'
import CatalogPage from './pages/catalog'
import ProductPage from './pages/product'
// Auth not required for Week 5
// import AuthPage from './pages/auth'
// import { AuthProvider } from './lib/auth'
import CartPage from './pages/cart'
import CheckoutPage from './pages/checkout'
import OrderStatusPage from './pages/order-status-sse'
import AdminDashboard from './pages/admin-dashboard'
import ProductAdmin from './pages/product-admin'
import HomePage from './pages/home'
import SupportPanel from './components/organisms/SupportPanel'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">ShopSmart</span>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex space-x-4">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link 
                  to="/catalog" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Catalog
                </Link>
                <Link 
                  to="/cart" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Cart
                </Link>
                <Link 
                  to="/admin" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
                <Link 
                  to="/admin/products" 
                  className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Products
                </Link>
              </nav>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/p/:id" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:id" element={<OrderStatusPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/products" element={<ProductAdmin />} />
          </Routes>
        </main>

      {/* Support Panel */}
      <SupportPanel />
    </div>
  )
}

export default App