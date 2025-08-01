import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './types/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});