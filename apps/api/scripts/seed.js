const { MongoClient, ObjectId } = require('mongodb');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Seed data
const customers = [
  {
    name: 'Demo User',
    email: 'demouser@example.com',
    phone: '+1-555-0100',
    address: '123 Demo Street, Test City, TC 12345'
  },
  {
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1-555-0101',
    address: '456 Oak Avenue, Springfield, SP 67890'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-0102',
    address: '789 Pine Road, Riverdale, RD 13579'
  },
  {
    name: 'Michael Brown',
    email: 'mbrown@email.com',
    phone: '+1-555-0103',
    address: '321 Elm Street, Hillview, HV 24680'
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1-555-0104',
    address: '654 Maple Drive, Lakeshore, LS 35791'
  },
  {
    name: 'David Wilson',
    email: 'david.w@email.com',
    phone: '+1-555-0105',
    address: '987 Cedar Lane, Mountain View, MV 46802'
  },
  {
    name: 'Lisa Anderson',
    email: 'lisa.anderson@email.com',
    phone: '+1-555-0106',
    address: '147 Birch Court, Seaside, SS 57913'
  },
  {
    name: 'Robert Taylor',
    email: 'rtaylor@email.com',
    phone: '+1-555-0107',
    address: '258 Spruce Way, Valley Heights, VH 68024'
  },
  {
    name: 'Jennifer Martinez',
    email: 'j.martinez@email.com',
    phone: '+1-555-0108',
    address: '369 Willow Street, Riverside, RS 79135'
  },
  {
    name: 'William Garcia',
    email: 'w.garcia@email.com',
    phone: '+1-555-0109',
    address: '741 Aspen Road, Hilltop, HT 80246'
  },
  {
    name: 'Amanda Thompson',
    email: 'amanda.t@email.com',
    phone: '+1-555-0110',
    address: '852 Poplar Avenue, Greenfield, GF 91357'
  },
  {
    name: 'Christopher Lee',
    email: 'chris.lee@email.com',
    phone: '+1-555-0111',
    address: '963 Sycamore Lane, Brookside, BS 02468'
  }
];

const products = [
  // Electronics
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality',
    price: 149.99,
    category: 'electronics',
    tags: ['audio', 'wireless', 'bluetooth'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 45
  },
  {
    name: 'Smart Watch Pro',
    description: 'Advanced fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life',
    price: 299.99,
    category: 'electronics',
    tags: ['wearable', 'fitness', 'smart'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 32
  },
  {
    name: 'Portable Charger 20000mAh',
    description: 'High-capacity portable battery pack with fast charging and dual USB ports',
    price: 49.99,
    category: 'electronics',
    tags: ['battery', 'portable', 'charging'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 78
  },
  {
    name: '4K Webcam',
    description: 'Professional 4K webcam with auto-focus and noise reduction for video calls',
    price: 129.99,
    category: 'electronics',
    tags: ['camera', 'video', 'computer'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 23
  },
  {
    name: 'Wireless Gaming Mouse',
    description: 'Ergonomic gaming mouse with RGB lighting and 16000 DPI precision',
    price: 79.99,
    category: 'electronics',
    tags: ['gaming', 'mouse', 'wireless'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 56
  },
  
  // Home & Kitchen
  {
    name: 'Smart Coffee Maker',
    description: 'Programmable coffee maker with WiFi connectivity and mobile app control',
    price: 179.99,
    category: 'home',
    tags: ['kitchen', 'coffee', 'smart'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 18
  },
  {
    name: 'Air Fryer Deluxe',
    description: '6-quart air fryer with digital display and 8 preset cooking programs',
    price: 89.99,
    category: 'home',
    tags: ['kitchen', 'cooking', 'appliance'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 41
  },
  {
    name: 'Robot Vacuum Cleaner',
    description: 'Smart robot vacuum with mapping technology and app control',
    price: 399.99,
    category: 'home',
    tags: ['cleaning', 'smart', 'vacuum'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 12
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with touch control and USB charging port',
    price: 39.99,
    category: 'home',
    tags: ['lighting', 'office', 'LED'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 67
  },
  {
    name: 'Bamboo Cutting Board Set',
    description: 'Set of 3 organic bamboo cutting boards in different sizes',
    price: 34.99,
    category: 'home',
    tags: ['kitchen', 'bamboo', 'eco-friendly'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 89
  },
  
  // Apparel
  {
    name: 'Premium Cotton T-Shirt',
    description: 'Soft organic cotton t-shirt available in multiple colors',
    price: 24.99,
    category: 'apparel',
    tags: ['clothing', 'cotton', 'casual'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 120
  },
  {
    name: 'Waterproof Hiking Jacket',
    description: 'Lightweight waterproof jacket with breathable fabric and hood',
    price: 129.99,
    category: 'apparel',
    tags: ['outdoor', 'jacket', 'waterproof'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 35
  },
  {
    name: 'Running Shoes Ultra',
    description: 'Professional running shoes with advanced cushioning technology',
    price: 159.99,
    category: 'apparel',
    tags: ['shoes', 'running', 'sports'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 28
  },
  {
    name: 'Yoga Pants Flex',
    description: 'High-waisted yoga pants with 4-way stretch fabric',
    price: 69.99,
    category: 'apparel',
    tags: ['fitness', 'yoga', 'pants'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 52
  },
  {
    name: 'Winter Gloves Touch',
    description: 'Insulated winter gloves with touchscreen-compatible fingertips',
    price: 29.99,
    category: 'apparel',
    tags: ['winter', 'gloves', 'accessories'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 94
  },
  
  // Accessories
  {
    name: 'Leather Wallet Classic',
    description: 'Genuine leather bi-fold wallet with RFID blocking',
    price: 49.99,
    category: 'accessories',
    tags: ['leather', 'wallet', 'RFID'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 73
  },
  {
    name: 'Sunglasses Polarized',
    description: 'UV400 polarized sunglasses with aluminum frame',
    price: 89.99,
    category: 'accessories',
    tags: ['sunglasses', 'UV protection', 'polarized'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 41
  },
  {
    name: 'Travel Backpack 40L',
    description: 'Durable travel backpack with multiple compartments and laptop sleeve',
    price: 79.99,
    category: 'accessories',
    tags: ['backpack', 'travel', 'storage'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 33
  },
  {
    name: 'Stainless Steel Water Bottle',
    description: 'Insulated water bottle that keeps drinks cold for 24 hours',
    price: 34.99,
    category: 'accessories',
    tags: ['bottle', 'insulated', 'eco-friendly'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 108
  },
  {
    name: 'Phone Case Armor',
    description: 'Heavy-duty phone case with military-grade drop protection',
    price: 39.99,
    category: 'accessories',
    tags: ['phone', 'protection', 'case'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 85
  },
  
  // Tools & Hardware
  {
    name: 'Cordless Drill Set',
    description: '20V cordless drill with 2 batteries and 30-piece bit set',
    price: 119.99,
    category: 'tools',
    tags: ['power tools', 'drill', 'cordless'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 19
  },
  {
    name: 'Tool Kit Professional',
    description: '128-piece professional tool kit with carrying case',
    price: 159.99,
    category: 'tools',
    tags: ['tools', 'kit', 'professional'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 24
  },
  {
    name: 'LED Flashlight Tactical',
    description: 'High-powered tactical flashlight with 5 modes and zoom',
    price: 44.99,
    category: 'tools',
    tags: ['flashlight', 'LED', 'tactical'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 62
  },
  {
    name: 'Multitool Swiss',
    description: '15-in-1 multitool with knife, pliers, and screwdrivers',
    price: 69.99,
    category: 'tools',
    tags: ['multitool', 'portable', 'swiss'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 48
  },
  {
    name: 'Safety Goggles Pro',
    description: 'Anti-fog safety goggles with UV protection',
    price: 19.99,
    category: 'tools',
    tags: ['safety', 'goggles', 'protection'],
    imageUrl: 'https://via.placeholder.com/300x300',
    stock: 156
  }
];

async function seedDatabase() {
  let client;
  
  try {
    console.log('🌱 Starting database seed...');
    
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    client = new MongoClient(uri);
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await db.collection('customers').deleteMany({});
    await db.collection('products').deleteMany({});
    await db.collection('orders').deleteMany({});
    
    // Insert customers
    console.log('👥 Inserting customers...');
    const customerDocs = customers.map(c => ({
      ...c,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const customerResult = await db.collection('customers').insertMany(customerDocs);
    console.log(`✅ Inserted ${customerResult.insertedCount} customers`);
    
    // Get inserted customer IDs
    const insertedCustomers = await db.collection('customers').find({}).toArray();
    const customerMap = {};
    insertedCustomers.forEach(c => {
      customerMap[c.email] = c._id;
    });
    
    // Insert products
    console.log('📦 Inserting products...');
    const productDocs = products.map(p => ({
      ...p,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    const productResult = await db.collection('products').insertMany(productDocs);
    console.log(`✅ Inserted ${productResult.insertedCount} products`);
    
    // Get inserted products for orders
    const insertedProducts = await db.collection('products').find({}).toArray();
    
    // Generate orders
    console.log('🛒 Generating orders...');
    const orders = [];
    const statuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    
    // Create 3 orders for demo user
    const demoUserId = customerMap['demouser@example.com'];
    
    // Demo user order 1 - Delivered
    orders.push({
      customerId: demoUserId.toString(),
      customerEmail: 'demouser@example.com',
      customerName: 'Demo User',
      items: [
        {
          productId: insertedProducts[0]._id.toString(),
          name: insertedProducts[0].name,
          price: insertedProducts[0].price,
          quantity: 1,
          subtotal: insertedProducts[0].price
        },
        {
          productId: insertedProducts[5]._id.toString(),
          name: insertedProducts[5].name,
          price: insertedProducts[5].price,
          quantity: 2,
          subtotal: insertedProducts[5].price * 2
        }
      ],
      total: insertedProducts[0].price + (insertedProducts[5].price * 2),
      status: 'DELIVERED',
      carrier: 'Express Shipping',
      estimatedDelivery: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { status: 'PROCESSING', timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
        { status: 'SHIPPED', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { status: 'DELIVERED', timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
      ]
    });
    
    // Demo user order 2 - Shipped
    orders.push({
      customerId: demoUserId.toString(),
      customerEmail: 'demouser@example.com',
      customerName: 'Demo User',
      items: [
        {
          productId: insertedProducts[10]._id.toString(),
          name: insertedProducts[10].name,
          price: insertedProducts[10].price,
          quantity: 3,
          subtotal: insertedProducts[10].price * 3
        }
      ],
      total: insertedProducts[10].price * 3,
      status: 'SHIPPED',
      carrier: 'Standard Shipping',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        { status: 'PROCESSING', timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: 'SHIPPED', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ]
    });
    
    // Demo user order 3 - Pending
    orders.push({
      customerId: demoUserId.toString(),
      customerEmail: 'demouser@example.com',
      customerName: 'Demo User',
      items: [
        {
          productId: insertedProducts[2]._id.toString(),
          name: insertedProducts[2].name,
          price: insertedProducts[2].price,
          quantity: 1,
          subtotal: insertedProducts[2].price
        },
        {
          productId: insertedProducts[8]._id.toString(),
          name: insertedProducts[8].name,
          price: insertedProducts[8].price,
          quantity: 1,
          subtotal: insertedProducts[8].price
        }
      ],
      total: insertedProducts[2].price + insertedProducts[8].price,
      status: 'PENDING',
      carrier: 'Standard Shipping',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
      statusHistory: [
        { status: 'PENDING', timestamp: new Date() }
      ]
    });
    
    // Generate random orders for other customers
    for (let i = 0; i < 15; i++) {
      const randomCustomer = insertedCustomers[Math.floor(Math.random() * insertedCustomers.length)];
      const numItems = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let orderTotal = 0;
      
      for (let j = 0; j < numItems; j++) {
        const randomProduct = insertedProducts[Math.floor(Math.random() * insertedProducts.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const subtotal = randomProduct.price * quantity;
        
        orderItems.push({
          productId: randomProduct._id.toString(),
          name: randomProduct.name,
          price: randomProduct.price,
          quantity,
          subtotal
        });
        
        orderTotal += subtotal;
      }
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      
      orders.push({
        customerId: randomCustomer._id.toString(),
        customerEmail: randomCustomer.email,
        customerName: randomCustomer.name,
        items: orderItems,
        total: Math.round(orderTotal * 100) / 100,
        status,
        carrier: Math.random() > 0.5 ? 'Express Shipping' : 'Standard Shipping',
        estimatedDelivery: new Date(Date.now() + (7 - daysAgo) * 24 * 60 * 60 * 1000),
        createdAt: createdDate,
        updatedAt: new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000),
        statusHistory: [
          { status: 'PENDING', timestamp: createdDate }
        ]
      });
    }
    
    const orderResult = await db.collection('orders').insertMany(orders);
    console.log(`✅ Inserted ${orderResult.insertedCount} orders`);
    
    console.log('\n📊 Seed Summary:');
    console.log(`- Customers: ${customerResult.insertedCount}`);
    console.log(`- Products: ${productResult.insertedCount}`);
    console.log(`- Orders: ${orderResult.insertedCount}`);
    console.log('\n✨ Database seeded successfully!');
    console.log('\n📧 Test User: demouser@example.com (has 3 orders)');
    
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('👋 Disconnected from MongoDB');
    }
  }
}

// Run seed
seedDatabase();
