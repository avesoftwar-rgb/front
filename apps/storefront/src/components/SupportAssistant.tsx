import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
  intent?: string
  functionsCalled?: string[]
  citations?: string[]
}

interface SupportAssistantProps {
  customer: any
}

const SupportAssistant: React.FC<SupportAssistantProps> = ({ customer }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [assistantInfo, setAssistantInfo] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load assistant info
    fetchAssistantInfo()
    
    // Add welcome message
    setMessages([{
      id: '1',
      text: "Hello! I'm Alex, your Customer Support Specialist at ShopSmart. How can I help you today? I can assist with orders, products, policies, or any other questions you have.",
      sender: 'assistant',
      timestamp: new Date()
    }])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchAssistantInfo = async () => {
    try {
      const info = await api.getAssistantInfo()
      setAssistantInfo(info)
    } catch (error) {
      console.error('Failed to fetch assistant info:', error)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)

    try {
      const response = await api.sendAssistantMessage(inputText, {
        customer: customer ? { id: customer._id, email: customer.email } : null
      })

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        sender: 'assistant',
        timestamp: new Date(),
        intent: response.intent,
        functionsCalled: response.functionsCalled,
        citations: response.citations
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        sender: 'assistant',
        timestamp: new Date()
      }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const getQuickActions = () => {
    const actions = [
      "What's your return policy?",
      "Track my recent order",
      "Show me wireless headphones",
      "How long does shipping take?",
      "I need help with a problem"
    ]

    if (customer) {
      actions[1] = `Check order status for ${customer.email}`
    }

    return actions
  }

  const handleQuickAction = (action: string) => {
    setInputText(action)
  }

  return (
    <div className="container">
      <div className="chat-container">
        <div className="card">
          <div style={{ borderBottom: '1px solid #ddd', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h3>Support Assistant</h3>
            {assistantInfo && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                {assistantInfo.identity.name} - {assistantInfo.identity.role}
              </p>
            )}
          </div>

          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <div>{message.text}</div>
                  
                  {message.intent && (
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                      Intent: {message.intent}
                    </div>
                  )}
                  
                  {message.functionsCalled && message.functionsCalled.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#0066cc', marginTop: '0.25rem' }}>
                      Functions: {message.functionsCalled.join(', ')}
                    </div>
                  )}
                  
                  {message.citations && message.citations.length > 0 && (
                    <div style={{ fontSize: '0.75rem', color: '#28a745', marginTop: '0.25rem' }}>
                      Sources: {message.citations.join(', ')}
                    </div>
                  )}
                  
                  <div className="message-time">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message assistant">
                <div className="message-content">
                  <div style={{ fontStyle: 'italic', color: '#666' }}>
                    Alex is typing...
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '1rem 0', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
              Quick Actions:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {getQuickActions().map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  style={{
                    padding: '0.25rem 0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '16px',
                    background: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#f0f0f0'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white'
                  }}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          <div className="chat-input">
            <input
              type="text"
              className="input"
              placeholder="Type your message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <button 
              className="btn" 
              onClick={handleSend}
              disabled={isTyping || !inputText.trim()}
            >
              Send
            </button>
          </div>
        </div>

        {/* Assistant Info */}
        {assistantInfo && (
          <div className="card" style={{ marginTop: '1rem' }}>
            <h4>Assistant Capabilities</h4>
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                <strong>Supported Topics:</strong>
              </p>
              <ul style={{ fontSize: '0.875rem', color: '#666', marginLeft: '1.5rem' }}>
                <li>Order tracking and status updates</li>
                <li>Product search and recommendations</li>
                <li>Store policies (returns, shipping, warranty)</li>
                <li>Customer complaints and issues</li>
                <li>General inquiries</li>
              </ul>
            </div>
            
            <div style={{ marginTop: '1rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                <strong>Available Functions:</strong>
              </p>
              <ul style={{ fontSize: '0.875rem', color: '#666', marginLeft: '1.5rem' }}>
                {assistantInfo.availableFunctions?.map((func: any, index: number) => (
                  <li key={index}>{func.description}</li>
                ))}
              </ul>
            </div>

            {assistantInfo.knowledgeBaseSize > 0 && (
              <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '1rem' }}>
                📚 Knowledge Base: {assistantInfo.knowledgeBaseSize} policies loaded
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportAssistant
