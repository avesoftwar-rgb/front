// SSE Client for real-time order tracking

import { useEffect, useState, useCallback } from 'react'

export interface OrderStatusEvent {
  type: 'status' | 'complete' | 'error'
  orderId?: string
  status?: string
  carrier?: string
  estimatedDelivery?: string
  timestamp?: Date
  message?: string
}

export class SSEClient {
  private eventSource: EventSource | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000 // 3 seconds

  constructor(
    private baseUrl: string = import.meta.env.VITE_API_URL || '/api'
  ) {}

  connect(
    orderId: string,
    onMessage: (event: OrderStatusEvent) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): void {
    if (this.eventSource) {
      this.disconnect()
    }

    const url = `${this.baseUrl}/orders/${orderId}/stream`
    console.log(`Connecting to SSE stream: ${url}`)

    try {
      this.eventSource = new EventSource(url)

      this.eventSource.onmessage = (event) => {
        try {
          const data: OrderStatusEvent = JSON.parse(event.data)
          onMessage(data)

          // Check if stream is complete
          if (data.type === 'complete') {
            console.log('Order tracking complete:', data.message)
            if (onComplete) onComplete()
            this.disconnect()
          }
        } catch (error) {
          console.error('Failed to parse SSE message:', error)
        }
      }

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error)
        
        // Handle reconnection
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++
          console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
          
          setTimeout(() => {
            this.connect(orderId, onMessage, onError, onComplete)
          }, this.reconnectDelay)
        } else {
          const err = new Error('Maximum reconnection attempts reached')
          if (onError) onError(err)
          this.disconnect()
        }
      }

      this.eventSource.onopen = () => {
        console.log('SSE connection established')
        this.reconnectAttempts = 0
      }

    } catch (error) {
      console.error('Failed to create EventSource:', error)
      if (onError) onError(error as Error)
    }
  }

  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
      console.log('SSE connection closed')
    }
  }

  isConnected(): boolean {
    return this.eventSource !== null && this.eventSource.readyState === EventSource.OPEN
  }
}

// Singleton instance for shared use
export const sseClient = new SSEClient()

export function useSSE(orderId: string | null) {
  const [events, setEvents] = useState<OrderStatusEvent[]>([])
  const [currentStatus, setCurrentStatus] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    if (!orderId) return

    const client = new SSEClient()
    setIsConnected(true)
    setError(null)

    client.connect(
      orderId,
      (event) => {
        setEvents((prev: OrderStatusEvent[]) => [...prev, event])
        if (event.status) {
          setCurrentStatus(event.status)
        }
      },
      (err) => {
        setError(err)
        setIsConnected(false)
      },
      () => {
        setIsConnected(false)
      }
    )

    return () => {
      client.disconnect()
      setIsConnected(false)
    }
  }, [orderId])

  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  const reconnect = useCallback(() => {
    connect()
  }, [connect])

  return {
    events,
    currentStatus,
    isConnected,
    error,
    reconnect
  }
}
