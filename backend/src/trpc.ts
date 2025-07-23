import { router } from './utils/trpc';
export const appRouter = router({});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
