# Deployment Guide - Week 5 MVP

This guide provides step-by-step instructions for deploying the complete Week 5 MVP application using free-tier services.

## Prerequisites

- Node.js 18+ installed locally
- Git installed and configured
- GitHub account
- Google account (for Colab)

## 1. MongoDB Atlas Setup (Database)

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (no credit card required)
3. Choose the FREE M0 tier

### Step 2: Create Cluster
1. Select your preferred cloud provider (AWS recommended)
2. Choose a region close to you
3. Name your cluster (e.g., "week5-mvp")
4. Click "Create Cluster" (takes 3-5 minutes)

### Step 3: Configure Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Username: `week5user`
4. Password: Generate a secure password (save this!)
5. Database User Privileges: "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
4. Confirm by clicking "Add IP Address"

### Step 5: Get Connection String
1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `myFirstDatabase` with `week5mvp`

Example connection string:
```
mongodb+srv://week5user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/week5mvp?retryWrites=true&w=majority
```

## 2. Backend Deployment (Render.com)

### Step 1: Prepare Repository
1. Push your code to GitHub
2. Ensure `package.json` has a `start` script
3. Create `.env.example` file (never commit actual `.env`)

### Step 2: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 3: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure service:
   - Name: `week5-mvp-api`
   - Environment: `Node`
   - Region: Choose closest to you
   - Branch: `main`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: `Free`

### Step 4: Add Environment Variables
Click "Environment" tab and add:
```
MONGODB_URI=mongodb+srv://week5user:PASSWORD@cluster.xxxxx.mongodb.net/week5mvp?retryWrites=true&w=majority
PORT=3001
NODE_ENV=production
CORS_ORIGINS=https://your-frontend-url.vercel.app
LLM_ENDPOINT=https://your-ngrok-url.ngrok-free.app/generate
```

### Step 5: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait for build to complete (3-5 minutes)
3. Your API will be available at: `https://week5-mvp-api.onrender.com`

## 3. Frontend Deployment (Vercel)

### Step 1: Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Authorize Vercel

### Step 2: Import Project
1. Click "New Project"
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: `Vite`
   - Root Directory: `apps/storefront`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Step 3: Environment Variables
Add these environment variables:
```
VITE_API_URL=https://week5-mvp-api.onrender.com/api
VITE_ENV=production
```

### Step 4: Deploy
1. Click "Deploy"
2. Wait for build (2-3 minutes)
3. Your frontend will be at: `https://your-project.vercel.app`

## 4. LLM Service (Google Colab + ngrok)

### Step 1: Set Up Week 3 Colab
Use your existing Week 3 Colab notebook with RAG system.

### Step 2: Add New Endpoint
Add this new endpoint to your existing Flask app (keep all Week 3 code):

```python
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Keep your existing Week 3 endpoints (/chat, etc.)

# ADD THIS NEW ENDPOINT FOR WEEK 5
@app.route('/generate', methods=['POST'])
def generate():
    """Simple text generation endpoint for Week 5"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        max_tokens = data.get('max_tokens', 500)
        
        # Use your existing model (llama, gpt2, etc.)
        # This is a simplified example
        response_text = model.generate(
            prompt,
            max_new_tokens=max_tokens,
            temperature=0.7
        )
        
        return jsonify({
            'text': response_text,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

# Keep your existing app.run() code
```

### Step 3: Set Up ngrok
```python
!pip install pyngrok
from pyngrok import ngrok

# Start Flask app in background
from threading import Thread
thread = Thread(target=lambda: app.run(port=5000))
thread.daemon = True
thread.start()

# Create ngrok tunnel
public_url = ngrok.connect(5000, "http")
print(f"Public URL: {public_url}")
print(f"Generate endpoint: {public_url}/generate")
```

### Step 4: Update Backend Environment
Copy the ngrok URL and update your Render environment variable:
```
LLM_ENDPOINT=https://xxxx-xxx.ngrok-free.app/generate
```

## 5. Running Locally

### Backend Setup
```bash
cd apps/api
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run seed  # Seed the database
npm start     # Start server on port 3001
```

### Frontend Setup
```bash
cd apps/storefront
cp .env.example .env
# Edit .env if needed
npm install
npm run dev   # Start dev server on port 5173
```

## 6. Environment Variables Reference

### Backend (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/week5mvp
PORT=3001
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
LLM_ENDPOINT=https://your-ngrok-url.ngrok-free.app/generate
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001/api
VITE_ENV=development
```

## 7. Verification Steps

### Test Database Connection
```bash
cd apps/api
npm run seed
# Should see: "✨ Database seeded successfully!"
```

### Test API Endpoints
```bash
# Get products
curl http://localhost:3001/api/products

# Lookup customer
curl "http://localhost:3001/api/customers?email=demouser@example.com"

# Health check
curl http://localhost:3001/api/health
```

### Test SSE Stream
```bash
# Get an order ID from the database first
curl http://localhost:3001/api/orders/ORDER_ID/stream
# Should see: data: {"type":"status"...
```

### Test Assistant
```bash
curl -X POST http://localhost:3001/api/assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What is your return policy?"}'
```

## 8. Production Checklist

- [ ] MongoDB Atlas cluster created and configured
- [ ] Database seeded with test data
- [ ] Backend deployed to Render with all env vars
- [ ] Frontend deployed to Vercel with API URL
- [ ] LLM service running on Colab with ngrok
- [ ] CORS configured correctly
- [ ] All endpoints tested and working
- [ ] SSE streams working
- [ ] Assistant responding correctly
- [ ] Test user (demouser@example.com) can log in

## 9. Troubleshooting

### MongoDB Connection Issues
- Verify IP whitelist includes 0.0.0.0/0
- Check username/password are correct
- Ensure database name in URI matches

### CORS Errors
- Add frontend URL to CORS_ORIGINS
- Ensure trailing slashes match

### SSE Not Working
- Check browser supports EventSource
- Verify no proxy/firewall blocking
- Ensure proper headers in response

### LLM Timeout
- Restart Colab notebook
- Regenerate ngrok URL
- Update LLM_ENDPOINT in backend

### Render.com Issues
- Free tier spins down after 15 mins inactivity
- First request after idle will be slow
- Check logs in Render dashboard

## 10. Demo Credentials

**Test User Email:** demouser@example.com

This user has:
- 3 pre-created orders
- Full customer profile
- Order history for testing

## Support

For issues with:
- MongoDB Atlas: https://docs.mongodb.com/manual/
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- ngrok: https://ngrok.com/docs
