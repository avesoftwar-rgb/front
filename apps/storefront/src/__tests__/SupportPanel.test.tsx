import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SupportPanel from '../components/organisms/SupportPanel'
import { answerQuestion } from '../assistant/engine'

// Mock the engine module
vi.mock('../assistant/engine')
const mockAnswerQuestion = vi.mocked(answerQuestion)

describe('SupportPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders support button initially', () => {
    render(<SupportPanel />)
    
    const supportButton = screen.getByLabelText('Open support panel')
    expect(supportButton).toBeInTheDocument()
  })

  it('opens panel when support button is clicked', () => {
    render(<SupportPanel />)
    
    const supportButton = screen.getByLabelText('Open support panel')
    fireEvent.click(supportButton)
    
    expect(screen.getByText('AI Support')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Ask a question or enter your order ID...')).toBeInTheDocument()
  })

  it('closes panel when close button is clicked', () => {
    render(<SupportPanel />)
    
    // Open panel
    const supportButton = screen.getByLabelText('Open support panel')
    fireEvent.click(supportButton)
    
    // Close panel
    const closeButton = screen.getByLabelText('Close support panel')
    fireEvent.click(closeButton)
    
    expect(screen.queryByText('Ask Support')).not.toBeInTheDocument()
  })

  it('submits question and displays response', async () => {
    mockAnswerQuestion.mockResolvedValue({
      answer: 'Test answer',
      qid: 'Q01',
      refused: false
    })

    render(<SupportPanel />)
    
    // Open panel
    const supportButton = screen.getByLabelText('Open support panel')
    fireEvent.click(supportButton)
    
    // Enter question
    const textarea = screen.getByPlaceholderText('Ask a question or enter your order ID...')
    fireEvent.change(textarea, { target: { value: 'Test question' } })
    
    // Submit
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(mockAnswerQuestion).toHaveBeenCalledWith('Test question')
      expect(screen.getByText('Test answer')).toBeInTheDocument()
    })
  })

  it('handles refused responses', async () => {
    mockAnswerQuestion.mockResolvedValue({
      refused: true
    })

    render(<SupportPanel />)
    
    // Open panel
    const supportButton = screen.getByLabelText('Open support panel')
    fireEvent.click(supportButton)
    
    // Enter question
    const textarea = screen.getByPlaceholderText('Ask a question or enter your order ID...')
    fireEvent.change(textarea, { target: { value: 'Out of scope question' } })
    
    // Submit
    const sendButton = screen.getByText('Send')
    fireEvent.click(sendButton)
    
    await waitFor(() => {
      expect(screen.getByText(/I can only help with order status and general store policies/)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    mockAnswerQuestion.mockImplementation(() => new Promise(resolve => 
      setTimeout(() => resolve({ answer: 'Test', refused: false }), 100)
    ))

    render(<SupportPanel />)
    
    // Open panel
    const supportButton = screen.getByLabelText('Open support panel')
    fireEvent.click(supportButton)
    
    // Enter question
    const textarea = screen.getByPlaceholderText('Ask a question or enter your order ID...')
    fireEvent.change(textarea, { target: { value: 'Test question' } })
    
    // Submit
    const sendButton = screen.getByRole('button', { name: /send/i })
    fireEvent.click(sendButton)
    
    expect(screen.getByText('Sending...')).toBeInTheDocument()
    expect(sendButton).toBeDisabled()
  })
})
