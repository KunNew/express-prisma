import { PrismaClient } from '@prisma/client';

// Declare global variable for prisma instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Set the global prisma instance in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV === 'development') {
  global.prisma = prisma;
}

export default prisma;