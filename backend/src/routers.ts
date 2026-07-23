import { certificateRouter } from "~/routers/certificate";
import { courseEventRouter } from "./routers/courseEvent";
import { courseRouter } from "./routers/course";
import { profileRouter } from "./routers/profile";
import { reservationRouter } from "~/routers/reservation";
import { router } from "~/utils/trpc";
import { userRouter } from "./routers/user";

export const appRouter = router({
  certificates: certificateRouter,
  courseEvents: courseEventRouter,
  courses: courseRouter,
  profiles: profileRouter,
  reservations: reservationRouter,
  users: userRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
