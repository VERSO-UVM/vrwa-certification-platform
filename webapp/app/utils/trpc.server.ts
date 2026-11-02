import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { LoaderFunctionArgs, Params } from "react-router";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import {
  makeTrpcClient,
  type QueryListFn,
  type TrpcQueryOptions,
} from "./trpc";
import { dehydrate, QueryClient } from "@tanstack/react-query";

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

/*
 * To return a dehydratedState from a loader() function.
 */
export async function prefetchQueries(
  queryClient: QueryClient,
  queries: ReadonlyArray<TrpcQueryOptions>,
) {
  await Promise.all(queries.map((q) => queryClient.prefetchQuery(q)));
  return {
    dehydratedState: dehydrate(queryClient),
  };
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
