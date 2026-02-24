import { adminRouter } from '~/routers/admin';
import { authRouter } from '~/routers/auth';
import { certificateRouter } from '~/routers/certificate';
import { courseManagerRouter } from './routers/courseManager'
import { router } from './utils/trpc';

export const appRouter = router({
  authRouter,
  adminRouter,
  certificateRouter,
  courseManagerRouter
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
