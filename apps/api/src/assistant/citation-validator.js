/**
 * Citation Validator
 * Validates policy citations in assistant responses against ground-truth.json
 */

const fs = require('fs');
const path = require('path');

// Load ground truth knowledge base
const groundTruthPath = path.join(__dirname, '..', '..', '..', '..', 'docs', 'ground-truth.json');
let knowledgeBase = [];

try {
  if (fs.existsSync(groundTruthPath)) {
    const data = fs.readFileSync(groundTruthPath, 'utf8');
    knowledgeBase = JSON.parse(data);
    console.log(`✅ Loaded ${knowledgeBase.length} policies from ground-truth.json`);
  } else {
    console.warn('⚠️ ground-truth.json not found, citation validation disabled');
  }
} catch (error) {
  console.error('❌ Error loading ground-truth.json:', error.message);
}

/**
 * Extract citations from text
 * Looks for patterns like [Policy3.1], [Shipping2.4], etc.
 * @param {string} text - Response text containing citations
 * @returns {string[]} Array of extracted policy IDs
 */
function extractCitations(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }
  
  // Match patterns like [PolicyID], [Policy3.1], [Shipping2.4], etc.
  const citationPattern = /\[([A-Za-z]+\d+(?:\.\d+)?)\]/g;
  const citations = [];
  let match;
  
  while ((match = citationPattern.exec(text)) !== null) {
    citations.push(match[1]);
  }
  
  // Remove duplicates
  return [...new Set(citations)];
}

/**
 * Validate citations against ground truth
 * @param {string[]} citations - Array of policy IDs to validate
 * @returns {Object} Validation result
 */
function validateCitations(citations) {
  const validCitations = [];
  const invalidCitations = [];
  const citationDetails = [];
  
  for (const citation of citations) {
    const policy = knowledgeBase.find(p => p.id === citation);
    
    if (policy) {
      validCitations.push(citation);
      citationDetails.push({
        id: citation,
        valid: true,
        category: policy.category,
        question: policy.question
      });
    } else {
      invalidCitations.push(citation);
      citationDetails.push({
        id: citation,
        valid: false,
        error: 'Policy ID not found in knowledge base'
      });
    }
  }
  
  return {
    isValid: invalidCitations.length === 0,
    totalCitations: citations.length,
    validCount: validCitations.length,
    invalidCount: invalidCitations.length,
    validCitations,
    invalidCitations,
    details: citationDetails
  };
}

/**
 * Validate response with citations
 * @param {string} responseText - Assistant response text
 * @returns {Object} Complete validation report
 */
function validateResponse(responseText) {
  const citations = extractCitations(responseText);
  
  if (citations.length === 0) {
    return {
      hasCitations: false,
      isValid: true,
      message: 'No citations found in response',
      citations: []
    };
  }
  
  const validation = validateCitations(citations);
  
  return {
    hasCitations: true,
    ...validation,
    responseText,
    extractedCitations: citations
  };
}

/**
 * Get policy by ID from knowledge base
 * @param {string} policyId - Policy ID to retrieve
 * @returns {Object|null} Policy object or null if not found
 */
function getPolicy(policyId) {
  return knowledgeBase.find(p => p.id === policyId) || null;
}

/**
 * Get all policies by category
 * @param {string} category - Category to filter by
 * @returns {Object[]} Array of policies in that category
 */
function getPoliciesByCategory(category) {
  return knowledgeBase.filter(p => p.category === category);
}

/**
 * Find relevant policies based on keywords
 * @param {string} query - User query
 * @returns {Object[]} Relevant policies
 */
function findRelevantPolicies(query) {
  if (!query) return [];
  
  const queryLower = query.toLowerCase();
  
  // Category keyword mapping
  const categoryKeywords = {
    'returns': ['return', 'refund', 'exchange', 'money back', 'cancel'],
    'shipping': ['ship', 'delivery', 'shipping', 'deliver', 'carrier'],
    'warranty': ['warranty', 'guarantee', 'defect', 'broken', 'repair'],
    'payment': ['payment', 'pay', 'credit card', 'paypal', 'finance'],
    'privacy': ['privacy', 'data', 'personal information', 'security'],
    'orders': ['order', 'track', 'status', 'cancel', 'modify'],
    'products': ['product', 'item', 'stock', 'availability', 'out of stock']
  };
  
  // Find matching category
  let matchedCategories = [];
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      matchedCategories.push(category);
    }
  }
  
  // Return policies from matched categories
  if (matchedCategories.length > 0) {
    return knowledgeBase.filter(p => 
      matchedCategories.includes(p.category)
    );
  }
  
  // Fallback: search in questions and answers
  return knowledgeBase.filter(p => 
    p.question.toLowerCase().includes(queryLower) ||
    p.answer.toLowerCase().includes(queryLower)
  );
}

/**
 * Format policy for citation
 * @param {Object} policy - Policy object
 * @returns {string} Formatted policy text with citation
 */
function formatPolicyWithCitation(policy) {
  if (!policy) return '';
  return `${policy.answer} [${policy.id}]`;
}

/**
 * Check if response is properly grounded
 * @param {string} responseText - Assistant response
 * @param {string[]} relevantPolicyIds - IDs of policies that should be cited
 * @returns {Object} Grounding check result
 */
function checkGrounding(responseText, relevantPolicyIds = []) {
  const citations = extractCitations(responseText);
  const validation = validateCitations(citations);
  
  // Check if all relevant policies are cited
  const missingCitations = relevantPolicyIds.filter(id => 
    !citations.includes(id)
  );
  
  // Check if response contains policy information without citation
  const suspiciousPatterns = [
    /\b30 days?\b/i,  // Common return policy timeframe
    /\b(5-7|2-3|24) (business )?days?\b/i,  // Shipping timeframes
    /\$\d+(\.\d{2})?/,  // Prices without citation
    /free shipping/i,  // Policy claim
    /warranty/i,  // Warranty claim
  ];
  
  let ungroundedClaims = [];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(responseText) && citations.length === 0) {
      ungroundedClaims.push(`Pattern '${pattern}' found without citation`);
    }
  }
  
  return {
    isProperlyGrounded: validation.isValid && missingCitations.length === 0,
    validation,
    missingCitations,
    ungroundedClaims,
    recommendation: ungroundedClaims.length > 0 
      ? 'Consider adding citations for policy-related claims'
      : 'Response is properly grounded'
  };
}

// Export functions
module.exports = {
  extractCitations,
  validateCitations,
  validateResponse,
  getPolicy,
  getPoliciesByCategory,
  findRelevantPolicies,
  formatPolicyWithCitation,
  checkGrounding,
  knowledgeBase
};
