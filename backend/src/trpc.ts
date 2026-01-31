import { z } from 'zod';
import { asc } from 'drizzle-orm';

import { authRouter } from './routers/auth';
import { basicProcedure, router } from './utils/trpc';
import db from './database';
import { profile } from './database/schema';

export const appRouter = router({
  authRouter,
  getProfiles: basicProcedure
    .query(async () => {
      return await db.client.select().from(profile).orderBy(asc(profile.lastName));
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
