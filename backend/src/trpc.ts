import { certificateRouter } from "~/routers/certificate";
import { reservationRouter } from "~/routers/reservation";
import { router } from "~/utils/trpc";
import { profileRouter } from "./routers/profile";
import { userRouter } from "./routers/user";
import { courseRouter } from "./routers/course";
import { courseEventRouter } from "./routers/courseEvent";

export const appRouter = router({
  certificates: certificateRouter,
  reservations: reservationRouter,
  profiles: profileRouter,
  users: userRouter,
  courses: courseRouter,
  courseEvents: courseEventRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
