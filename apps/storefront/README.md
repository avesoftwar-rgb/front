# Storefront v1

A minimal, fast e-commerce storefront built with React, TypeScript, and Tailwind CSS.

## Features

- **Product Catalog**: Browse products with search, filtering, and sorting
- **Product Details**: View individual products with related items
- **Shopping Cart**: Persistent cart with quantity controls
- **Checkout**: Demo checkout process with order placement
- **Order Tracking**: Track order status with real-time updates
- **AI Support**: Ask Support panel with ground-truth Q&A system

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Build Tool**: Vite
- **State Management**: Zustand
- **Routing**: React Router DOM
- **Testing**: Vitest, Testing Library

## Project Structure

```
/src/
  /pages/          # Route components
    catalog.tsx
    product.tsx
    cart.tsx
    checkout.tsx
    order-status.tsx
  /components/     # Atomic design components
    /atoms/        # Basic UI elements (Button, Input, LoadingSpinner)
    /molecules/    # Composite components (ProductCard, SearchBox, TagFilter)
    /organisms/    # Complex components (SupportPanel)
    /templates/    # Page layouts (PageLayout)
  /lib/            # Utilities and state
    api.ts         # Mock API functions
    store.ts       # Zustand cart state
    format.ts      # Currency formatting
  /assistant/      # Support engine
    ground-truth.json
    prompt.txt
    engine.ts
  /__tests__/      # Unit tests
```

## Run Instructions

```bash
# Install dependencies
pnpm install
# or: npm install

# Start development server
pnpm dev
# or: npm run dev

# Build for production
pnpm build
# or: npm run build

# Run tests
pnpm test
# or: npm test

# Run Storybook
pnpm storybook
# or: npm run storybook
```

## Development Server

The development server runs on `http://localhost:5174` by default.

## API Endpoints

- `listProducts()` - Get all products
- `getProduct(id)` - Get product by ID
- `placeOrder(cart)` - Create new order
- `getOrderStatus(id)` - Get order status

## Support System

The Ask Support panel uses a ground-truth Q&A system that:
- Answers questions from a predefined knowledge base
- Handles order status queries
- Provides citations for answers
- Refuses out-of-scope questions politely

## Environment Variables

Create a `.env` file for optional configuration:

```
# Optional: OpenAI API Key for enhanced support
OPENAI_API_KEY=your_key_here
```

## License

MIT
