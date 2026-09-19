import { NextRequest, NextResponse } from 'next/server';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../../../db/schema';

// Initialize Neon database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

export async function GET(request: NextRequest) {
  try {
    console.log('🔥 Fetching warm chapters from database...');
    
    // Fetch all active warm chapters ordered by display_order
    const warmChapters = await db.select().from(schema.warmChapters)
      .where(schema.warmChapters.isActive)
      .orderBy(schema.warmChapters.displayOrder);
    
    console.log(`✅ Found ${warmChapters.length} warm chapters`);
    
    return NextResponse.json(warmChapters);
  } catch (error: any) {
    console.error('❌ Get warm chapters error:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message }, 
      { status: 500 }
    );
  }
}
