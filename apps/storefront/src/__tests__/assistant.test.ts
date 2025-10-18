import { describe, it, expect, vi, beforeEach } from 'vitest'
import { answerQuestion } from '../assistant/engine'
import { getOrderStatus } from '../lib/api'

// Mock the API module
vi.mock('../lib/api')
const mockGetOrderStatus = vi.mocked(getOrderStatus)

describe('Assistant Engine', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns refused for empty question', async () => {
    const result = await answerQuestion('')
    expect(result.refused).toBe(true)
  })

  it('returns refused for whitespace-only question', async () => {
    const result = await answerQuestion('   ')
    expect(result.refused).toBe(true)
  })

  it('handles order ID lookup', async () => {
    const mockOrderStatus = {
      orderId: 'ORDER123456',
      status: 'Shipped' as const,
      carrier: 'ACME Logistics',
      eta: '2024-01-15T00:00:00.000Z'
    }

    mockGetOrderStatus.mockResolvedValueOnce(mockOrderStatus)

    const result = await answerQuestion('ORDER123456')
    
    expect(mockGetOrderStatus).toHaveBeenCalledWith('ORDER123456')
    expect(result.refused).toBe(false)
    expect(result.answer).toContain('Order *******3456 status: Shipped')
    expect(result.answer).toContain('Carrier: ACME Logistics')
  })

  it('returns refused for non-existent order ID', async () => {
    mockGetOrderStatus.mockResolvedValueOnce(null)

    const result = await answerQuestion('NONEXISTENT123')
    
    expect(result.refused).toBe(true)
  })

  it('answers policy questions with high confidence', async () => {
    const result = await answerQuestion('What is your returns policy?')
    
    expect(result.refused).toBe(false)
    expect(result.answer).toContain('30 days')
    expect(result.qid).toBe('Q01')
  })

  it('answers shipping questions', async () => {
    const result = await answerQuestion('How long does shipping take?')
    
    expect(result.refused).toBe(false)
    expect(result.answer).toContain('3-5 business days')
    expect(result.qid).toBe('Q02')
  })

  it('answers warranty questions', async () => {
    const result = await answerQuestion('Do products have warranty?')
    
    expect(result.refused).toBe(false)
    expect(result.answer).toContain('1-year limited warranty')
    expect(result.qid).toBe('Q03')
  })

  it('answers payment questions', async () => {
    const result = await answerQuestion('What payment methods are accepted?')
    
    expect(result.refused).toBe(false)
    expect(result.answer).toContain('credit cards')
    expect(result.qid).toBe('Q04')
  })

  it('refuses out-of-scope questions', async () => {
    const result = await answerQuestion('How do I cook pasta?')
    
    expect(result.refused).toBe(true)
  })

  it('refuses questions with low confidence', async () => {
    const result = await answerQuestion('xyz abc def ghi jkl mno pqr stu vwx yza')
    
    expect(result.refused).toBe(true)
  })

  it('masks PII in order IDs', async () => {
    const mockOrderStatus = {
      orderId: 'VERYLONGORDERID123456',
      status: 'Delivered' as const,
      carrier: 'ACME Logistics',
      eta: '2024-01-15T00:00:00.000Z'
    }

    mockGetOrderStatus.mockResolvedValueOnce(mockOrderStatus)

    const result = await answerQuestion('VERYLONGORDERID123456')
    
    expect(result.answer).toContain('Order *****************3456')
    expect(result.answer).not.toContain('VERYLONGORDERID123456')
  })

  it('includes citation in answers', async () => {
    const result = await answerQuestion('What is your returns policy?')
    
    expect(result.answer).toContain('[Q01]')
  })
})
