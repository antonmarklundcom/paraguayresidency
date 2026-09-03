import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema';

/**
 * Lazy pool. The database is NEVER touched at build time — `next build` must
 * work with no DATABASE_URL (plan §4.5, deploy skill §6a).
 */
let pool: mysql.Pool | undefined;
let database: MySql2Database<typeof schema> | undefined;

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb(): MySql2Database<typeof schema> {
  if (!hasDatabase()) {
    throw new Error('DATABASE_URL is not set — no database connection available.');
  }
  if (!database) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      // Hostinger MySQL caps concurrent connections per user.
      connectionLimit: 8,
      timezone: 'Z',
      enableKeepAlive: true,
    });
    database = drizzle(pool, { schema, mode: 'default' });
  }
  return database;
}

/** `SELECT 1` with a hard timeout — used by /api/health. */
export async function pingDatabase(timeoutMs = 2000): Promise<'ok' | 'down'> {
  if (!hasDatabase()) return 'down';
  try {
    const ping = getDb().execute('select 1');
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('db ping timeout')), timeoutMs),
    );
    await Promise.race([ping, timeout]);
    return 'ok';
  } catch {
    return 'down';
  }
}

export { schema };
