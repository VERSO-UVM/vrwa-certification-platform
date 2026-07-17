import { adminRouter } from "~/routers/admin";
import { certificateRouter } from "~/routers/certificate";
import { reservationRouter } from "~/routers/reservation";
import { router } from "~/utils/trpc";
import { courseManagerRouter } from "./routers/courseManager";
import { profileRouter } from "./routers/profile";
import { userRouter } from "./routers/user";

export const appRouter = router({
  adminRouter,
  certificateRouter,
  reservation: reservationRouter,
  profile: profileRouter,
  user: userRouter,
  courseManagerRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
