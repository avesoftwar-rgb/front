import React, { useState, useEffect } from 'react'
import { api } from '../lib/api'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const AdminDashboard: React.FC = () => {
  const [businessMetrics, setBusinessMetrics] = useState<any>(null)
  const [performance, setPerformance] = useState<any>(null)
  const [assistantStats, setAssistantStats] = useState<any>(null)
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'business' | 'performance' | 'assistant'>('business')

  useEffect(() => {
    fetchAllMetrics()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAllMetrics, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAllMetrics = async () => {
    setLoading(true)
    try {
      const [business, perf, assistant, health] = await Promise.all([
        api.getBusinessMetrics(),
        api.getPerformance(),
        api.getAssistantStats(),
        api.getSystemHealth()
      ])
      
      setBusinessMetrics(business)
      setPerformance(perf)
      setAssistantStats(assistant)
      setSystemHealth(health)
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const getRevenueChartData = () => {
    if (!businessMetrics?.revenueChart) return null

    return {
      labels: businessMetrics.revenueChart.map((item: any) => 
        new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      ),
      datasets: [
        {
          label: 'Daily Revenue',
          data: businessMetrics.revenueChart.map((item: any) => item.revenue),
          borderColor: '#0066cc',
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          tension: 0.4
        }
      ]
    }
  }

  const getCategoryChartData = () => {
    if (!businessMetrics?.categoryBreakdown) return null

    return {
      labels: businessMetrics.categoryBreakdown.map((item: any) => item.category),
      datasets: [
        {
          label: 'Revenue by Category',
          data: businessMetrics.categoryBreakdown.map((item: any) => item.revenue),
          backgroundColor: [
            '#0066cc',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#17a2b8'
          ]
        }
      ]
    }
  }

  const getIntentChartData = () => {
    if (!assistantStats?.intentDistribution) return null

    const intents = Object.entries(assistantStats.intentDistribution)
    
    return {
      labels: intents.map(([key]) => key),
      datasets: [
        {
          label: 'Query Distribution',
          data: intents.map(([_, value]) => value as number),
          backgroundColor: [
            '#0066cc',
            '#28a745',
            '#ffc107',
            '#dc3545',
            '#17a2b8',
            '#6c757d',
            '#343a40'
          ]
        }
      ]
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      
      {/* System Health Status */}
      <div className="card">
        <h3>System Health</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>
                {systemHealth?.status === 'healthy' ? '✅' : '⚠️'}
              </span>
              <div>
                <div className="stat-label">Overall Status</div>
                <div style={{ fontWeight: 'bold', color: systemHealth?.status === 'healthy' ? '#28a745' : '#ffc107' }}>
                  {systemHealth?.status?.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">Database</div>
            <div style={{ fontWeight: 'bold', color: systemHealth?.services?.database?.status === 'operational' ? '#28a745' : '#dc3545' }}>
              {systemHealth?.services?.database?.status}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">LLM Service</div>
            <div style={{ fontWeight: 'bold', color: systemHealth?.services?.llm?.status === 'operational' ? '#28a745' : '#dc3545' }}>
              {systemHealth?.services?.llm?.status}
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-label">API Uptime</div>
            <div style={{ fontWeight: 'bold' }}>
              {Math.floor((systemHealth?.services?.api?.uptime || 0) / 60)}m
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            className={`btn ${activeTab === 'business' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('business')}
          >
            Business Metrics
          </button>
          <button
            className={`btn ${activeTab === 'performance' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
          <button
            className={`btn ${activeTab === 'assistant' ? '' : 'btn-secondary'}`}
            onClick={() => setActiveTab('assistant')}
          >
            Assistant Analytics
          </button>
        </div>

        {/* Business Metrics Tab */}
        {activeTab === 'business' && businessMetrics && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(businessMetrics.summary.totalRevenue)}</div>
                <div className="stat-label">Total Revenue</div>
                <div className={`stat-change ${businessMetrics.summary.revenueGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {businessMetrics.summary.revenueGrowth > 0 ? '↑' : '↓'} {Math.abs(businessMetrics.summary.revenueGrowth)}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{businessMetrics.summary.totalOrders}</div>
                <div className="stat-label">Total Orders</div>
                <div className={`stat-change ${businessMetrics.summary.orderGrowth >= 0 ? 'positive' : 'negative'}`}>
                  {businessMetrics.summary.orderGrowth > 0 ? '↑' : '↓'} {Math.abs(businessMetrics.summary.orderGrowth)}%
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(businessMetrics.summary.avgOrderValue)}</div>
                <div className="stat-label">Avg Order Value</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{formatCurrency(businessMetrics.summary.todayRevenue)}</div>
                <div className="stat-label">Today's Revenue</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {businessMetrics.summary.todayOrders} orders
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            {getRevenueChartData() && (
              <div style={{ marginTop: '2rem' }}>
                <h4>Revenue Trend (Last 7 Days)</h4>
                <div style={{ height: '300px', marginTop: '1rem' }}>
                  <Line
                    data={getRevenueChartData()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'top' },
                        tooltip: {
                          callbacks: {
                            label: (context: any) => `Revenue: ${formatCurrency(context.parsed.y)}`
                          }
                        }
                      },
                      scales: {
                        y: {
                          ticks: {
                            callback: (value: any) => formatCurrency(value as number)
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {getCategoryChartData() && (
              <div style={{ marginTop: '2rem' }}>
                <h4>Revenue by Category</h4>
                <div style={{ height: '300px', marginTop: '1rem' }}>
                  <Pie
                    data={getCategoryChartData()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'right' },
                        tooltip: {
                          callbacks: {
                            label: (context: any) => `${context.label}: ${formatCurrency(context.parsed)}`
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && performance && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Database Size</div>
                <div className="stat-value">{performance.database.dataSize} MB</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {performance.database.documentCounts.customers} customers,{' '}
                  {performance.database.documentCounts.products} products,{' '}
                  {performance.database.documentCounts.orders} orders
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">API Performance</div>
                <div className="stat-value">{performance.api.avgResponseTime}ms</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Avg response time
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Memory Usage</div>
                <div className="stat-value">{performance.api.memoryUsage.heapUsed} MB</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  of {performance.api.memoryUsage.heapTotal} MB
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">SSE Streams</div>
                <div className="stat-value">{performance.sse.activeConnections}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Active connections
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem' }}>
              <h4>System Metrics</h4>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>API Uptime</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {Math.floor(performance.api.uptime / 60)} minutes
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>Requests/min</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {performance.api.requestsPerMinute}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>Error Rate</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {performance.api.errorRate}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>SSE Streams Today</td>
                    <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                      {performance.sse.totalStreamsToday}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Assistant Tab */}
        {activeTab === 'assistant' && assistantStats && (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{assistantStats.totalQueries}</div>
                <div className="stat-label">Total Queries</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  {assistantStats.queriesLastHour} in last hour
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">{assistantStats.avgResponseTime}ms</div>
                <div className="stat-label">Avg Response Time</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">
                  {Object.values(assistantStats.functionCalls || {}).reduce((a: number, b: any) => a + (b as number), 0)}
                </div>
                <div className="stat-label">Function Calls</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-value">
                  {Object.keys(assistantStats.intentDistribution || {}).length}
                </div>
                <div className="stat-label">Intent Types</div>
              </div>
            </div>

            {/* Intent Distribution */}
            {getIntentChartData() && (
              <div style={{ marginTop: '2rem' }}>
                <h4>Query Intent Distribution</h4>
                <div style={{ height: '300px', marginTop: '1rem' }}>
                  <Bar
                    data={getIntentChartData()!}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Function Calls */}
            <div style={{ marginTop: '2rem' }}>
              <h4>Function Usage</h4>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Function</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Calls</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(assistantStats.functionCalls || {}).map(([func, count]) => (
                    <tr key={func}>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee' }}>{func}</td>
                      <td style={{ padding: '0.5rem', borderBottom: '1px solid #eee', textAlign: 'right' }}>
                        {count as number}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Queries */}
            <div style={{ marginTop: '2rem' }}>
              <h4>Recent Queries</h4>
              <div style={{ marginTop: '1rem' }}>
                {assistantStats.recentQueries?.map((query: any, index: number) => (
                  <div key={index} style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className={`badge badge-${query.intent === 'order_status' ? 'processing' : 'pending'}`}>
                        {query.intent}
                      </span>
                      <span style={{ fontSize: '0.875rem', color: '#666' }}>
                        {new Date(query.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                      Response time: {query.responseTime}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
