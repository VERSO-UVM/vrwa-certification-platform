import { z } from 'zod';
import { authRouter } from './routers/auth';
import { basicProcedure, router } from './utils/trpc';
export const appRouter = router({
  authRouter,
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
