import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import db from '../database';
import { admin, organization } from 'better-auth/plugins';
import { ac, roles } from './permissions';

export const auth = betterAuth({
  database: drizzleAdapter(db.client, {
    provider: 'pg', // or "mysql", "sqlite"
  }),
  plugins: [
    admin({
      ac,
      roles,
    }),
    organization(),
  ],
  experimental: { joins: true },
});
