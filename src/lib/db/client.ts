import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL environment variable is required. See .env.example for setup instructions."
    );
  }
  return url;
}

// Lazy initialization to avoid connection errors at import time
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!_db) {
    _client = postgres(getDatabaseUrl(), {
      prepare: false, // Required for Supabase Transaction pool mode
    });
    _db = drizzle({ client: _client, schema });
  }
  return _db;
}

/**
 * Close the database connection pool. Call this at the end of CLI scripts
 * so the Node process can exit — otherwise the postgres client keeps the
 * event loop alive and the script hangs after "Complete".
 */
export async function closeDb(): Promise<void> {
  if (_client) {
    await _client.end({ timeout: 5 });
    _client = null;
    _db = null;
  }
}
