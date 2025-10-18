import React from 'react'

interface PageLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="space-y-6">
      {(title || subtitle) && (
        <div className="text-center">
          {title && (
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          )}
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
