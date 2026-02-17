import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '../database';

export const auth = betterAuth({
  database: drizzleAdapter(db.client, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
});
