const express = require('express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const { classifyIntent, INTENTS } = require('./intent-classifier');
const functionRegistry = require('./function-registry');
const citationValidator = require('./citation-validator');

const router = express.Router();

// Load configuration
let assistantConfig = null;
let knowledgeBase = null;

// Load YAML configuration
function loadConfig() {
  try {
    const yamlPath = path.join(__dirname, '../../../../docs/prompts.yaml');
    if (fs.existsSync(yamlPath)) {
      const yamlContent = fs.readFileSync(yamlPath, 'utf8');
      assistantConfig = yaml.load(yamlContent);
      console.log('✅ Assistant configuration loaded');
    } else {
      console.warn('⚠️ prompts.yaml not found, using defaults');
      assistantConfig = getDefaultConfig();
    }
  } catch (error) {
    console.error('Error loading prompts.yaml:', error);
    assistantConfig = getDefaultConfig();
  }
}

// Load knowledge base
function loadKnowledgeBase() {
  try {
    const kbPath = path.join(__dirname, '../../../../docs/ground-truth.json');
    if (fs.existsSync(kbPath)) {
      const kbContent = fs.readFileSync(kbPath, 'utf8');
      knowledgeBase = JSON.parse(kbContent);
      console.log(`✅ Knowledge base loaded: ${knowledgeBase.length} policies`);
    } else {
      console.warn('⚠️ ground-truth.json not found');
      knowledgeBase = [];
    }
  } catch (error) {
    console.error('Error loading ground-truth.json:', error);
    knowledgeBase = [];
  }
}

// Get default configuration if YAML not found
function getDefaultConfig() {
  return {
    identity: {
      name: 'Alex',
      role: 'Customer Support Specialist',
      company: 'ShopSmart',
      personality: ['helpful', 'professional', 'friendly', 'efficient']
    },
    intents: {
      policy_question: {
        behavior: 'Provide accurate policy information with citations',
        tone: 'informative and clear'
      },
      order_status: {
        behavior: 'Look up order information and provide status',
        tone: 'professional and helpful'
      },
      product_search: {
        behavior: 'Help find products that match customer needs',
        tone: 'enthusiastic and helpful'
      },
      complaint: {
        behavior: 'Listen with empathy and offer solutions',
        tone: 'empathetic and solution-focused'
      },
      chitchat: {
        behavior: 'Be friendly but redirect to support topics',
        tone: 'warm and professional'
      },
      off_topic: {
        behavior: 'Politely decline and redirect to e-commerce support',
        tone: 'polite and professional'
      },
      violation: {
        behavior: 'Set boundaries firmly but professionally',
        tone: 'firm and professional'
      }
    },
    rules: [
      'Never reveal you are an AI or language model',
      'Never mention ChatGPT, Claude, Llama, or any AI model names',
      'Always respond as a human support specialist',
      'Maximum 2 function calls per query',
      'Keep responses concise and helpful',
      'Always use citations when referencing policies'
    ]
  };
}

// Find relevant policies based on user query
function findRelevantPolicies(userQuery) {
  if (!knowledgeBase || knowledgeBase.length === 0) {
    return [];
  }
  
  const query = userQuery.toLowerCase();
  
  // Category keywords mapping
  const categoryKeywords = {
    'returns': ['return', 'refund', 'exchange', 'money back', 'send back'],
    'shipping': ['ship', 'delivery', 'deliver', 'arrival', 'transit', 'carrier'],
    'warranty': ['warranty', 'guarantee', 'defect', 'broken', 'repair'],
    'privacy': ['privacy', 'data', 'personal information', 'secure', 'confidential'],
    'payment': ['payment', 'pay', 'credit card', 'billing', 'charge'],
    'general': ['policy', 'term', 'condition', 'rule']
  };
  
  // Find matching category
  let matchedCategories = [];
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => query.includes(kw))) {
      matchedCategories.push(category);
    }
  }
  
  // Find policies matching the categories
  let relevantPolicies = [];
  if (matchedCategories.length > 0) {
    relevantPolicies = knowledgeBase.filter(p => 
      matchedCategories.includes(p.category)
    );
  }
  
  // If no category match, try direct question matching
  if (relevantPolicies.length === 0) {
    relevantPolicies = knowledgeBase.filter(p => {
      const pQuestion = p.question.toLowerCase();
      const pAnswer = p.answer.toLowerCase();
      return query.includes(pQuestion.slice(0, 20)) || 
             pQuestion.includes(query.slice(0, 20));
    });
  }
  
  return relevantPolicies.slice(0, 3); // Return max 3 policies
}

// Extract citations from response
function extractCitations(response) {
  const citationPattern = /\[(Policy[\w.]+)\]/g;
  const matches = response.match(citationPattern);
  
  if (!matches) {
    return [];
  }
  
  return matches.map(m => m.slice(1, -1)); // Remove brackets
}

// Validate citations against knowledge base
function validateCitations(citations) {
  const validCitations = [];
  const invalidCitations = [];
  
  for (const citation of citations) {
    const found = knowledgeBase.find(p => p.id === citation);
    if (found) {
      validCitations.push(citation);
    } else {
      invalidCitations.push(citation);
    }
  }
  
  return {
    isValid: invalidCitations.length === 0,
    validCitations,
    invalidCitations
  };
}

// Handle policy questions with knowledge base
async function handlePolicyQuestion(query) {
  // Find relevant policies from knowledge base
  const relevantPolicies = citationValidator.findRelevantPolicies(query);
  
  if (relevantPolicies.length === 0) {
    return "I couldn't find specific policy information for your question. Please contact our customer service team for more details.";
  }
  
  // Use the most relevant policy and format with citation
  const policy = relevantPolicies[0];
  const formattedResponse = citationValidator.formatPolicyWithCitation(policy);
  
  return `${formattedResponse}\n\nIs there anything else you'd like to know about our policies?`;
}

// Handle order status queries
async function handleOrderStatus(query) {
  // Extract order ID from query
  const orderIdPattern = /\b(\d{10,}|[a-f0-9]{24})\b/i;
  const match = query.match(orderIdPattern);
  
  if (!match) {
    return "I'd be happy to check your order status. Please provide your order ID (it should be a long number or code).";
  }
  
  const orderId = match[1];
  
  // Execute function to get order status
  const result = await functionRegistry.execute('getOrderStatus', { orderId });
  
  if (result.success) {
    const order = result.result;
    return `📦 **Order Status Update**\n\n` +
           `Order ID: ${order.orderId}\n` +
           `Status: **${order.status}**\n` +
           `Customer: ${order.customerName}\n` +
           `Total: $${order.total}\n` +
           `Carrier: ${order.carrier || 'Standard Shipping'}\n` +
           `Estimated Delivery: ${new Date(order.estimatedDelivery).toLocaleDateString()}\n\n` +
           `Your order is being processed and you'll receive updates as it progresses.`;
  } else {
    return `I couldn't find an order with ID: ${orderId}. Please double-check the order ID or contact our support team.`;
  }
}

// Generate response based on intent
async function generateResponse(userInput, intent, functionResults = []) {
  const config = assistantConfig.identity;
  const intentConfig = assistantConfig.intents[intent.intent];
  
  let response = {
    text: '',
    intent: intent.intent,
    confidence: intent.confidence,
    functionsExecuted: [],
    citations: [],
    citationValidation: null
  };
  
  switch (intent.intent) {
    case INTENTS.POLICY_QUESTION:
      // Use knowledge base for policy questions
      const policyResponse = await handlePolicyQuestion(userInput);
      response.text = policyResponse;
      
      // Validate citations
      const validation = citationValidator.validateResponse(policyResponse);
      response.citations = validation.extractedCitations || [];
      response.citationValidation = validation;
      break;
      
    case INTENTS.ORDER_STATUS:
      const orderResponse = await handleOrderStatus(userInput);
      response.text = orderResponse;
      response.functionsExecuted.push('getOrderStatus');
      
      // Check if response contains any policy citations
      if (orderResponse.includes('[')) {
        const validation = citationValidator.validateResponse(orderResponse);
        response.citations = validation.extractedCitations || [];
        response.citationValidation = validation;
      }
      break;
      
    case INTENTS.PRODUCT_SEARCH:
      if (functionResults.length > 0 && functionResults[0].success) {
        const result = functionResults[0].result;
        if (result.products.length > 0) {
          response.text = `I found ${result.count} products matching your search:\n\n`;
          for (const product of result.products) {
            response.text += `• **${product.name}** - $${product.price}\n`;
            response.text += `  ${product.description.substring(0, 100)}...\n`;
            response.text += `  Stock: ${product.stock > 0 ? `✅ Available (${product.stock} units)` : '❌ Out of stock'}\n\n`;
          }
          response.text += `Would you like more details about any of these products?`;
        } else {
          response.text = `I couldn't find any products matching your search. Try using different keywords or browse our categories for more options.`;
        }
      } else {
        response.text = `I can help you find products! What are you looking for today? You can search by product name, category, or describe what you need.`;
      }
      break;
      
    case INTENTS.COMPLAINT:
      response.text = `I sincerely apologize for the trouble you're experiencing. Your satisfaction is very important to us, and I want to make this right.\n\n`;
      response.text += `Could you please provide more details about the issue? If this is about a specific order, please share the order ID so I can investigate immediately.`;
      break;
      
    case INTENTS.CHITCHAT:
      response.text = `Hello! I'm ${config.name}, your ${config.role} at ${config.company}. I'm here to help with your shopping needs, order inquiries, or any questions about our policies. How can I assist you today?`;
      break;
      
    case INTENTS.OFF_TOPIC:
      response.text = `I appreciate your question, but I'm specifically trained to help with ${config.company} shopping, orders, and policies. Is there anything related to our store that I can help you with today?`;
      break;
      
    case INTENTS.VIOLATION:
      response.text = `I understand you may be frustrated, but I need to maintain a professional conversation. I'm here to help with your ${config.company} needs. Please let me know how I can assist you with your shopping or order concerns.`;
      break;
      
    default:
      response.text = `I'm here to help! You can ask me about products, check your order status, or learn about our policies. What would you like to know?`;
  }
  
  return response;
}

// Call LLM service (mock for local testing)
async function callLLM(prompt) {
  // In production, this would call the actual LLM endpoint
  const llmEndpoint = process.env.LLM_ENDPOINT;
  
  if (llmEndpoint) {
    try {
      const response = await fetch(llmEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          max_tokens: 500
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.text;
      }
    } catch (error) {
      console.error('LLM call failed:', error);
    }
  }
  
  // Fallback for testing without LLM
  return `[Mock LLM Response] Based on the prompt, I would provide helpful information here.`;
}

// Main assistant endpoint
router.post('/chat', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: {
          code: 'MISSING_MESSAGE',
          message: 'Message is required'
        }
      });
    }
    
    // Classify intent
    const intent = classifyIntent(message);
    console.log(`Intent classified: ${intent.intent} (confidence: ${intent.confidence})`);
    
    // Prepare to track function calls
    const functionsCalled = [];
    const functionResults = [];
    
    // Execute functions based on intent (max 2 function calls)
    if (intent.intent === INTENTS.ORDER_STATUS) {
      // Extract order ID from message
      const orderIdMatch = message.match(/[0-9a-f]{24}/i);
      if (orderIdMatch) {
        const result = await functionRegistry.execute('getOrderStatus', {
          orderId: orderIdMatch[0]
        });
        functionsCalled.push('getOrderStatus');
        functionResults.push(result);
      }
    } else if (intent.intent === INTENTS.PRODUCT_SEARCH) {
      // Extract search query
      const searchMatch = message.match(/(?:looking for|search|find|show me)\s+(.+)/i);
      if (searchMatch) {
        const result = await functionRegistry.execute('searchProducts', {
          query: searchMatch[1],
          limit: 5
        });
        functionsCalled.push('searchProducts');
        functionResults.push(result);
      }
    }
    
    // Generate response
    const response = await generateResponse(message, intent, functionResults);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Update assistant stats
    try {
      await fetch(`http://localhost:${process.env.PORT || 3001}/api/dashboard/assistant-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: intent.intent,
          functionsCalled,
          responseTime
        })
      });
    } catch (error) {
      // Ignore stats update errors
    }
    
    res.json({
      response: response.text,
      intent: response.intent,
      confidence: response.confidence,
      functionsExecuted: response.functionsExecuted,
      citations: response.citations,
      citationValidation: response.citationValidation,
      responseTime,
      assistant: {
        name: assistantConfig.identity.name,
        role: assistantConfig.identity.role
      }
    });
  } catch (error) {
    console.error('Assistant error:', error);
    res.status(500).json({
      error: {
        code: 'ASSISTANT_ERROR',
        message: 'Failed to process your request'
      }
    });
  }
});

// Get assistant information
router.get('/info', (req, res) => {
  res.json({
    identity: assistantConfig.identity,
    supportedIntents: Object.keys(INTENTS).map(k => ({
      name: INTENTS[k],
      description: assistantConfig.intents[INTENTS[k]]?.behavior
    })),
    availableFunctions: functionRegistry.getAllSchemas().map(s => ({
      name: s.name,
      description: s.description
    })),
    knowledgeBaseSize: knowledgeBase.length
  });
});

// Initialize on module load
loadConfig();
loadKnowledgeBase();

module.exports = {
  assistantRouter: router
};
