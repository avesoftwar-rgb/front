export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export function formatOrderId(orderId: string): string {
  if (orderId.length <= 4) return orderId
  return '*'.repeat(orderId.length - 4) + orderId.slice(-4)
}
