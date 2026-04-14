import { protectedProcedure, publicProcedure, router } from "~/utils/trpc";

export const authRouter = router({
  getMe: protectedProcedure.query(({ ctx }) => {
    return ctx.account;
  }),
});
