import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "./types/schema";

neonConfig.webSocketConstructor = ws;

// Make database connection optional
let pool: Pool | null = null;
let db: any = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 10, // Maximum number of connections
      idleTimeoutMillis: 90000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
    });
    db = drizzle({ client: pool, schema });
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Failed to establish database connection:", error);
    pool = null;
    db = null;
  }
} else {
  console.log("No DATABASE_URL found. Running without database connection.");
}

if (!db) {
  console.error("Database connection failed: DATABASE_URL is missing or invalid, or Drizzle could not connect. Check your .env and NeonDB credentials.");
}

export { pool, db };