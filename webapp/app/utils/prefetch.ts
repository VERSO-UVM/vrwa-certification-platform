/**
 * For prefetching of queries with SSR. These helpers are designed to be DRY to avoid
 * the prefetched data getting out of sync with the data used in the components.
 */
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type {
  ClientLoaderFunctionArgs,
  LoaderFunctionArgs,
  Params,
} from "react-router";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import {
  type TRPC,
  type TrpcQueryOptions,
} from "./trpc";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import { getServerTrpc } from "./trpc.server";

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

export type QueryListFn<P extends Params> = (
  trpc: TRPC,
  params: P,
  searchParams: URLSearchParams,
) => ReadonlyArray<TrpcQueryOptions>;

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

/**
 * Create a clientLoader() that fills the browser query cache on
 * client-side navigations. Uses ensureQueryData so cached data is
 * returned immediately; revalidateIfStale refreshes in the background.
 */
export function prefetchClientLoader<T extends Params>(
  queryListFn: QueryListFn<T>,
) {
  return async ({ request, params }: ClientLoaderFunctionArgs) => {
    const queryClient = getQueryClient();
    const trpc = createTRPCOptionsProxy<AppRouter>({
      client: getBrowserTrpcClient(),
      queryClient,
    });
    const queries = queryListFn(
      trpc,
      params as T,
      new URL(request.url).searchParams,
    );
    await Promise.all(
      queries.map((q) =>
        queryClient.ensureQueryData({ ...q, revalidateIfStale: true }),
      ),
    );
    return null;
  };
}
