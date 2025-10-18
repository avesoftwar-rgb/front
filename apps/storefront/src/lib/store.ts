import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, CartItem } from '../types'

interface CartState {
  items: CartItem[]
  add: (product: Product, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      add: (product, qty = 1) => {
        set(state => {
          const existingItem = state.items.find(item => item.id === product.id)
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, qty: item.qty + qty }
                  : item
              )
            }
          }
          return {
            items: [...state.items, { id: product.id, qty, product }]
          }
        })
      },
      
      remove: (id) => {
        set(state => ({
          items: state.items.filter(item => item.id !== id)
        }))
      },
      
      setQty: (id, qty) => {
        if (qty <= 0) {
          get().remove(id)
          return
        }
        set(state => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, qty } : item
          )
        }))
      },
      
      clear: () => {
        set({ items: [] })
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => 
          total + (item.qty * item.product.price), 0
        )
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.qty, 0)
      }
    }),
    {
      name: 'storefront-cart'
    }
  )
)
