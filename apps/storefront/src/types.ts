export interface Product {
  id: string
  title: string
  price: number
  image: string
  tags: string[]
  stockQty: number
  description?: string
}

export interface CartItem {
  id: string
  qty: number
  product: Product
}

export interface OrderStatus {
  orderId: string
  status: 'Placed' | 'Packed' | 'Shipped' | 'Delivered'
  carrier?: string
  eta?: string
}

export interface GroundTruthItem {
  qid: string
  category: string
  question: string
  answer: string
}
