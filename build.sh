#!/bin/bash
# Render Build Script for ShopMart E-Commerce Platform

echo "🚀 Starting Render Build Process..."

# Check if running in API or Frontend context
if [ -d "src" ] && [ -f "package.json" ]; then
    echo "📦 Building API Service..."
    
    # Install production dependencies only
    npm ci --only=production
    
    echo "✅ API Build Complete!"
    
elif [ -f "vite.config.ts" ] && [ -f "package.json" ]; then
    echo "🎨 Building Frontend Service..."
    
    # Install all dependencies (including dev for build)
    npm ci
    
    # Build the frontend
    npm run build
    
    # Check if build was successful
    if [ -d "dist" ]; then
        echo "✅ Frontend Build Complete! Build output in ./dist"
    else
        echo "❌ Build failed: dist directory not found"
        exit 1
    fi
    
else
    echo "❌ Unknown service type. Cannot determine build process."
    exit 1
fi

echo "🎉 Build process completed successfully!"
