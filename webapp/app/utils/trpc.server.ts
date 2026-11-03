import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import { makeTrpcClient } from "./trpc";

/**
 * Access `trpc` in an incoming request on the server.
 */
export function getServerTrpc(request: Request) {
  const queryClient = getQueryClient();
  const trpc = createTRPCOptionsProxy<AppRouter>({
    client: makeTrpcClient({ cookie: request.headers.get("cookie") ?? "" }),
    queryClient,
  });
  return [queryClient, trpc] as const;
}
