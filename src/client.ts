import { PrismaClient } from '@prisma/client';

// Declare global variable for prisma instance
declare global {
  var db: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const db = global.db || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Set the global prisma instance in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV === 'development') {
  global.db = db;
}

export default db;