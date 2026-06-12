import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  console.warn('Failed to set DNS servers:', e);
}

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required');
}

const mongoUri: string = MONGODB_URI;

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: 'jobtrackr',
    });

    isConnected = true;
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
  isConnected = false;
});

export function getConnectionStatus(): boolean {
  return isConnected;
}
