import { z } from 'zod';
import { asc } from 'drizzle-orm';

import { authRouter } from './routers/auth';
import { basicProcedure, router } from './utils/trpc';
import db from './database';
import { profile } from './database/schema';
export const appRouter = router({
  authRouter,
  getProfiles: basicProcedure
    .query(async (opts) => {
      return await db.client.select().from(profile).orderBy(asc(profile.lastName));
    }),
  hello: basicProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `...${opts.input.text}!`,
      };
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
