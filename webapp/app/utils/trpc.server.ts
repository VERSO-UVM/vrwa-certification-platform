import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/routers";
import { makeTrpcClient } from "./trpc";
import type { Params, LoaderFunctionArgs } from "react-router";
import { type QueryListFn, prefetchQueries } from "./prefetch";
import { makeQueryClient } from "./query-client";
import { cache } from "react";

// Create a stable getter for the query client that will return the
// same client during the same request.
export const getQueryClient = cache(makeQueryClient);

/**
 * Access `trpc` in an incoming request on the server.
 */
export function getServerTrpc(request: Request) {
  const queryClient = getQueryClient();
  return createTRPCOptionsProxy<AppRouter>({
    client: makeTrpcClient({ cookie: request.headers.get("cookie") ?? "" }),
    queryClient,
  });
}

/**
 * Create a loader() function that can be exported directly
 * for a component.
 */
export function prefetchLoader<T extends Params>(queryListFn: QueryListFn<T>) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const queryClient = getQueryClient();
    const trpc = getServerTrpc(request);
    return await prefetchQueries(
      queryClient,
      queryListFn(trpc, params as T, new URL(request.url).searchParams),
    );
  };
}
