# ShopSmart - Week 5 Final MVP 🛒

## Overview
Complete e-commerce platform with real-time order tracking, intelligent support assistant, and admin dashboard.

## 🎯 Features
- ✅ RESTful API with MongoDB-style aggregation
- ✅ Server-Sent Events (SSE) for real-time order tracking
- ✅ Intelligent Support Assistant with 7 intent detection
- ✅ Function Registry for assistant actions
- ✅ Citation Validation for policy responses
- ✅ Admin Dashboard with business metrics
- ✅ Complete test coverage

## 🧪 Test User Account
**Email:** `demouser@example.com`  
**Name:** Demo User  
**Orders:** 3 orders (DELIVERED, SHIPPED, PENDING)

### How to Test
1. Visit http://localhost:5173
2. Browse products and add to cart
3. At checkout, enter email: `demouser@example.com`
4. No password required (Week 5 requirement)
5. View your orders and track their status

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (optional - file storage included)

### Local Development

#### 1. Backend API
```bash
cd apps/api
npm install
npm run start:dynamic  # File-based storage
# OR
npm run start:demo     # In-memory storage
```
API will run on http://localhost:3001

#### 2. Frontend
```bash
cd apps/storefront
npm install
npm run dev
```
Frontend will run on http://localhost:5173

### Database Seeding
```bash
cd apps/api
npm run seed
```
Seeds:
- 25 products across multiple categories
- 12 customers (including test user)
- 18 orders with various statuses

## 📁 Project Structure
```
/apps/api/
  src/
    server-dynamic.js      # Main server with file persistence
    sse/order-status.js    # SSE with auto-simulation
    assistant/
      intent-classifier.js # 7 intents detection
      function-registry.js # Callable functions
      citation-validator.js # Policy citation validation
      engine.js           # Assistant orchestration
      
/apps/storefront/
  src/
    pages/
      admin-dashboard.tsx  # Business metrics
      order-status-sse.tsx # Real-time tracking
    lib/
      api.ts              # API client
      sse-client.ts       # SSE handler

/docs/
  prompts.yaml            # Assistant identity
  ground-truth.json       # 15 policy documents
  deployment-guide.md     # Complete deployment steps

/tests/
  api.test.js             # API endpoint tests
  assistant.test.js       # Intent & identity tests
  integration.test.js     # End-to-end workflows
```

## 🔑 Key Endpoints

### Customer API (No Auth Required)
- `GET /api/customers?email=demouser@example.com` - Lookup by email
- `GET /api/customers/:id` - Get customer details

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details
- `GET /api/orders/:id/stream` - SSE live tracking
- `GET /api/orders?customerId=:id` - Customer orders

### Analytics (MongoDB-style Aggregation)
- `GET /api/analytics/daily-revenue?from=&to=` - Revenue aggregation

### Dashboard
- `GET /api/dashboard/business-metrics` - Revenue, orders
- `GET /api/dashboard/performance` - System metrics
- `GET /api/dashboard/assistant-stats` - Assistant analytics
- `GET /api/dashboard/system-health` - Health check

### Assistant
- `POST /api/assistant/chat` - Chat with assistant

## 🤖 Assistant Features

### Supported Intents
1. `policy_question` - Returns, shipping, warranties
2. `order_status` - Order tracking queries  
3. `product_search` - Product searches
4. `complaint` - Customer complaints
5. `chitchat` - Greetings, small talk
6. `off_topic` - Unrelated topics
7. `violation` - Inappropriate content

### Identity
- **Name:** Alex
- **Role:** Customer Support Specialist
- **Company:** ShopSmart
- **Never reveals:** AI model identity

### Functions Available
- `getOrderStatus(orderId)`
- `searchProducts(query, limit)`
- `getCustomerOrders(email)`
- `getStorePolicy(category)`
- `checkProductAvailability(productId)`

## 🧪 Testing

### Run All Tests
```bash
cd apps/api
npm test
```

### Test Categories
- **Intent Detection:** All 7 intents with examples
- **Identity Tests:** Doesn't reveal AI model
- **Function Calling:** Correct execution
- **API Tests:** All endpoints
- **Integration Tests:** Complete workflows

## 📊 SSE Order Tracking

### Auto-Simulation Flow
1. Connect to `/api/orders/:id/stream`
2. Receive current status immediately
3. Auto-progresses every 3-5 seconds:
   - PENDING → PROCESSING (3s)
   - PROCESSING → SHIPPED (5s)
   - SHIPPED → DELIVERED (5s)
4. Updates database and sends events
5. Stream closes at DELIVERED

### Test SSE
1. Create an order
2. Navigate to http://localhost:5173/order/[ORDER_ID]
3. Watch real-time status updates

## 🎨 Admin Dashboard
Visit http://localhost:5173/admin

### Features
- Total revenue & order count
- Average order value
- Revenue charts (7-day trend)
- Orders by status breakdown
- Category performance
- System health monitoring
- Assistant performance metrics

## 🚢 Deployment

### 📘 Complete Deployment Guide
See **[Deployment Guide](./docs/deployment-guide.md)** for detailed step-by-step instructions in Arabic and English.

### Quick Deployment Steps:

#### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. MongoDB Atlas Setup
1. Create free M0 cluster at https://www.mongodb.com/cloud/atlas
2. Add database user with read/write permissions
3. Whitelist 0.0.0.0/0 in Network Access
4. Copy connection string

#### 3. Deploy Backend on Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repo: `avesoftwar-rgb/ahmaddd`
4. Configure:
   - Root Directory: `apps/api`
   - Build Command: `npm install --production`
   - Start Command: `npm start`
5. Add Environment Variables:
   ```
   MONGODB_URI=mongodb+srv://...
   PORT=3001
   NODE_ENV=production
   CORS_ORIGINS=https://your-frontend-url.vercel.app
   ```
6. Deploy and copy your backend URL

#### 4. Deploy Frontend on Vercel
1. Go to https://vercel.com
2. Import GitHub repo
3. Configure:
   - Root Directory: `apps/storefront`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
5. Deploy!

#### 5. Update CORS
Go back to Render and update `CORS_ORIGINS` with your Vercel URL.

### Using render.yaml
This project includes a `render.yaml` file for automatic deployment:
```bash
# Just push to GitHub and connect in Render Dashboard
# render.yaml will configure everything automatically
```

### LLM Endpoint (Optional)
Add to Week 3 Colab:
```python
@app.route('/generate', methods=['POST'])
def generate():
    prompt = request.json.get('prompt')
    response = model.generate(prompt)
    return jsonify({"text": response})
```

## 📝 Environment Variables
See `.env.example`:
```
PORT=3001
MONGODB_URI=mongodb://... (optional)
LLM_ENDPOINT=https://... (optional)
NODE_ENV=development
```

## 🛡️ Security Notes
- No authentication required (Week 5 spec)
- Email-only identification
- No passwords stored or validated
- CORS enabled for development

## 📚 Documentation
- [Deployment Guide](docs/deployment-guide.md)
- [Assistant Configuration](docs/prompts.yaml)
- [Policy Knowledge Base](docs/ground-truth.json)

## 📧 Support
Test account issues? Use: `demouser@example.com`

---
**Week 5 Final MVP Assignment - Ready for Submission ✅**
