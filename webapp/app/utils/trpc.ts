import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/trpc";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
export const trpc = useTRPC;
export type { AppRouter };
