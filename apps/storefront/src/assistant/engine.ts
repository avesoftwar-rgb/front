import groundTruth from './ground-truth.json'
import { getOrderStatus } from '../lib/api'
import type { GroundTruthItem } from '../types'

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

export async function answerQuestion(question: string): Promise<{
  answer?: string
  qid?: string
  refused: boolean
}> {
  const q = question.trim()
  if (!q) return { refused: true }

  // Check for order ID pattern
  const orderIdMatch = q.match(/([A-Z0-9]{10,})/i)
  if (orderIdMatch) {
    const orderId = orderIdMatch[1]
    const status = await getOrderStatus(orderId)
    if (!status) {
      return { refused: true }
    }
    
    const maskedId = '*'.repeat(orderId.length - 4) + orderId.slice(-4)
    return {
      answer: `Order ${maskedId} status: ${status.status}.${status.carrier ? ` Carrier: ${status.carrier}.` : ''}${status.eta ? ` ETA: ${new Date(status.eta).toLocaleDateString()}.` : ''}`,
      refused: false
    }
  }

  // Find best matching Q&A
  const questionTokens = tokenize(q)
  let bestMatch: { qid: string; score: number; answer: string } | null = null

  for (const item of groundTruth as GroundTruthItem[]) {
    const itemTokens = tokenize(item.question)
    const overlap = itemTokens.filter(token => questionTokens.includes(token)).length
    const score = itemTokens.length > 0 ? overlap / itemTokens.length : 0
    
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { qid: item.qid, score, answer: item.answer }
    }
  }

  // Check confidence threshold
  if (!bestMatch || bestMatch.score < 0.25) {
    return { refused: true }
  }

  return {
    answer: `${bestMatch.answer} [${bestMatch.qid}]`,
    qid: bestMatch.qid,
    refused: false
  }
}
