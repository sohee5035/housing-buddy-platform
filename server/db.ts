import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// 연결 풀 최적화
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

export const db = drizzle({ client: pool, schema });

// 데이터베이스 웜업 함수
export async function warmupDatabase() {
  try {
    console.log('[DB] Warming up database connection...');
    const startTime = Date.now();
    await pool.query('SELECT 1');
    const duration = Date.now() - startTime;
    console.log(`[DB] Database warmed up in ${duration}ms`);
  } catch (error) {
    console.error('[DB] Database warmup failed:', error);
  }
}

// Keep-alive: 5분마다 DB 연결 유지
setInterval(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Keep-alive ping sent');
  } catch (error) {
    console.error('[DB] Keep-alive ping failed:', error);
  }
}, 5 * 60 * 1000); // 5분