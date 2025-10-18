import { useEffect, useState } from 'react'
import { apiClient } from '../lib/api-client'

interface DashboardMetrics {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  recentOrders: any[]
  topProducts: any[]
  performanceMetrics: any
  assistantStats: any
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load multiple endpoints in parallel
      const [dashboardMetrics, _, performance, assistantStats] = await Promise.all([
        apiClient.get('/api/analytics/dashboard-metrics'),
        apiClient.get('/api/dashboard/business-metrics'),
        apiClient.get('/api/dashboard/performance'),
        apiClient.get('/api/dashboard/assistant-stats')
      ])

      setMetrics({
        totalRevenue: dashboardMetrics.totalRevenue || 0,
        totalOrders: dashboardMetrics.totalOrders || 0,
        totalCustomers: dashboardMetrics.totalCustomers || 0,
        averageOrderValue: dashboardMetrics.averageOrderValue || 0,
        recentOrders: dashboardMetrics.recentOrders || [],
        topProducts: dashboardMetrics.topProducts || [],
        performanceMetrics: performance,
        assistantStats: assistantStats
      })
    } catch (err) {
      console.error('Failed to load dashboard:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Monitor your store performance and analytics</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics?.totalRevenue.toLocaleString() || '0'}`}
          icon="💰"
          color="bg-green-500"
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders || '0'}
          icon="📦"
          color="bg-blue-500"
        />
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers || '0'}
          icon="👥"
          color="bg-purple-500"
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${metrics?.averageOrderValue.toFixed(2) || '0'}`}
          icon="📊"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {metrics?.recentOrders?.slice(0, 5).map((order: any) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order._id.slice(-8)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Products</h2>
        <div className="space-y-3">
          {metrics?.topProducts?.slice(0, 5).map((product: any, index: number) => (
            <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-lg font-semibold text-gray-600">#{index + 1}</span>
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">Sold: {product.soldCount} units</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">${product.revenue.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Revenue</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* API Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">API Performance</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Average Latency</span>
              <span className="font-semibold">{metrics?.performanceMetrics?.averageLatency || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Requests</span>
              <span className="font-semibold">{metrics?.performanceMetrics?.totalRequests || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active SSE Connections</span>
              <span className="font-semibold">{metrics?.performanceMetrics?.activeSSEConnections || 0}</span>
            </div>
          </div>
        </div>

        {/* Assistant Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Assistant Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Queries</span>
              <span className="font-semibold">{metrics?.assistantStats?.totalQueries || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-semibold">{metrics?.assistantStats?.avgResponseTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Function Calls</span>
              <span className="font-semibold">{metrics?.assistantStats?.functionCalls || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Metric Card Component
function MetricCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} rounded-full p-3 text-white text-2xl`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
