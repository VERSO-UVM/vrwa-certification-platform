import { adminRouter } from './routers/admin';
import { authRouter } from './routers/auth';
import { certificateRouter } from './routers/certificate';
import { router } from './utils/trpc';

export const appRouter = router({
  authRouter,
  adminRouter,
  certificateRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
