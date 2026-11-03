import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import { makeTrpcClient } from "./trpc";
import type { Params, LoaderFunctionArgs } from "react-router";
import { type QueryListFn, prefetchQueries } from "./prefetch";

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

/**
 * Create a loader() function that can be exported directly
 * for a component.
 */
export function prefetchLoader<T extends Params>(queryListFn: QueryListFn<T>) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const [queryClient, trpc] = getServerTrpc(request);
    return await prefetchQueries(
      queryClient,
      queryListFn(trpc, params as T, new URL(request.url).searchParams),
    );
  };
}
