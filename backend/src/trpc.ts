import { adminRouter } from "~/routers/admin";
import { accountRouter } from "~/routers/account";
import { authRouter } from "~/routers/auth";
import { certificateRouter } from "~/routers/certificate";
import { reservationRouter } from "~/routers/reservation";
import { router } from "~/utils/trpc";
import { courseManagerRouter } from "./routers/courseManager";
import { profileRouter } from "./routers/profile";

import { instructorRouter } from "./routers/instructor";

import { traineeRouter } from "./routers/trainee";

export const appRouter = router({
  authRouter,
  account: accountRouter,
  adminRouter,
  certificateRouter,
  reservation: reservationRouter,
  profile: profileRouter,
  courseManagerRouter,
  instructor: instructorRouter,
  trainee: traineeRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
