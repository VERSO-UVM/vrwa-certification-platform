import { authRouter } from './auth/router';
import { router } from './utils/trpc';
export const appRouter = router({
  authRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
