import type { Meta, StoryObj } from '@storybook/react'
import { BrowserRouter } from 'react-router-dom'
import PageLayout from '../components/templates/PageLayout'

const meta: Meta<typeof PageLayout> = {
  title: 'Templates/PageLayout',
  component: PageLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Page Content</h1>
        <p className="text-gray-600">This is the main content area of the page layout.</p>
      </div>
    ),
  },
}

export const WithCards: Story = {
  args: {
    children: (
      <div className="p-8 space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Card 1</h3>
            <p className="text-gray-600">Card content goes here</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Card 2</h3>
            <p className="text-gray-600">Card content goes here</p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold mb-2">Card 3</h3>
            <p className="text-gray-600">Card content goes here</p>
          </div>
        </div>
      </div>
    ),
  },
}

export const WithForm: Story = {
  args: {
    children: (
      <div className="max-w-md mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Contact Form</h1>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input type="text" className="input-field" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input type="email" className="input-field" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea className="input-field" rows={4} placeholder="Your message..." />
          </div>
          <button type="submit" className="btn-primary w-full">
            Send Message
          </button>
        </form>
      </div>
    ),
  },
}

export const WithTable: Story = {
  args: {
    children: (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #12345
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Oct 11, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Delivered
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $299.99
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #12344
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Oct 10, 2025
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Shipped
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  $149.99
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
  },
}

export const EmptyState: Story = {
  args: {
    children: (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
          <button className="btn-primary">Browse Products</button>
        </div>
      </div>
    ),
  },
}

export const LoadingState: Story = {
  args: {
    children: (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    ),
  },
}

export const WithSidebar: Story = {
  args: {
    children: (
      <div className="flex gap-8 p-8">
        <aside className="w-64">
          <div className="card">
            <h3 className="font-semibold mb-4">Navigation</h3>
            <nav className="space-y-2">
              <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Dashboard</a>
              <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Products</a>
              <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Orders</a>
              <a href="#" className="block px-3 py-2 rounded hover:bg-gray-100">Settings</a>
            </nav>
          </div>
        </aside>
        <main className="flex-1">
          <h1 className="text-3xl font-bold mb-4">Main Content</h1>
          <div className="card">
            <p className="text-gray-600">This layout includes a sidebar navigation.</p>
          </div>
        </main>
      </div>
    ),
  },
}
