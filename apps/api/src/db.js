const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    
    await client.connect();
    
    // Extract database name from URI or use default
    const dbName = process.env.MONGODB_DB_NAME || 'shopmart';
    db = client.db(dbName);
    
    // Verify connection with a ping
    await db.admin().ping();
    
    // Create indexes for better performance
    await createIndexes();
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes() {
  try {
    // Customers indexes
    await db.collection('customers').createIndex({ email: 1 }, { unique: true });
    
    // Products indexes
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ price: 1 });
    
    // Orders indexes
    await db.collection('orders').createIndex({ customerId: 1 });
    await db.collection('orders').createIndex({ status: 1 });
    await db.collection('orders').createIndex({ createdAt: -1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('Index creation error:', error);
  }
}

function getDB() {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
}

async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  getDB,
  closeDB
};
