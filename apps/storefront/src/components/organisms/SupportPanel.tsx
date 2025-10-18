import React, { useState } from 'react'
import { answerQuestion } from '../../assistant/engine'
import { useFocusTrap } from '../../lib/useFocusTrap'

export default function SupportPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useFocusTrap(isOpen)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!question.trim()) return

    setIsLoading(true)
    try {
      const result = await answerQuestion(question)
      if (result.refused) {
        setResponse('I can only help with order status and general store policies. Please contact support@storefront.com for other inquiries.')
      } else {
        setResponse(result.answer || 'No response available')
      }
    } catch (error) {
      setResponse('Sorry, I encountered an error. Please try again or contact support@storefront.com')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setQuestion('')
    setResponse('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  return (
    <>
      {/* Support Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 z-40 group"
        aria-label="Open support panel"
      >
        <svg className="w-6 h-6 transition-transform duration-300 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 animate-ping opacity-20"></div>
      </button>

      {/* Support Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4 animate-fadeIn" onKeyDown={handleKeyDown}>
          <div ref={modalRef} className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col transform animate-slideUp">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">AI Support</h2>
                  <p className="text-sm text-gray-600">How can I help you?</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                aria-label="Close support panel"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {/* Response Area */}
              {response && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 animate-fadeIn">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-green-800 mb-2">AI Response</h3>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{response}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">How to use:</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>Ask about store policies (returns, shipping, etc.)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>Check order status by entering your order ID</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                        <span>Get help with product information</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question or enter your order ID..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 bg-white"
                    rows={3}
                    disabled={isLoading}
                  />
                  {isLoading && (
                    <div className="absolute right-3 top-3">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-6 py-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all duration-200 font-medium"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!question.trim() || isLoading}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                      !question.trim() || isLoading
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>Send</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
