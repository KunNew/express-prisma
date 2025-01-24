import { PrismaClient } from '@prisma/client';

// Declare global variable for prisma instance
declare global {
  var db: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const db = global.db || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Add Prisma middleware
db.$use(async (params, next) => {
  // Create middleware
  if (params.model === 'Company' && params.action === 'create') {
    const result = await next(params);
    await db.counter.upsert({
      where: { 
        id: `app_companiesCode_${result.code}` 
      },
      update: { 
        seqVal: result.code 
      },
      create: {
        id: `app_companiesCode_${result.code}`,
        seqVal: result.code
      }
    });
    return result;
  }

  // Delete middleware
  if (params.model === 'Company' && params.action === 'delete') {
    // Get the company before deletion
    const company = await db.company.findUnique({
      where: params.args.where
    });
    
    if (company) {
      // Delete the associated counter
      await db.counter.delete({
        where: {
          id: `app_companiesCode_${company.code}`
        }
      }).catch(() => {
        // Ignore if counter doesn't exist
        console.log('Counter not found or already deleted');
      });
    }
    
    return next(params);
  }

  return next(params);
});

if (process.env.NODE_ENV === 'development') {
  global.db = db;
}

export default db;