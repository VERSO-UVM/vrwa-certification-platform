/**
 * For prefetching of queries with SSR. These helpers are designed to be DRY to avoid
 * the prefetched data getting out of sync with the data used in the components.
 */
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import {
  type ClientLoaderFunctionArgs,
  type Params,
  useMatches,
  type UIMatch,
} from "react-router";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import { getTrpcClient, type TRPC, type TrpcQueryOptions } from "./trpc";
import {
  dehydrate,
  type DehydratedState,
  QueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";

export type PrefetchLoaderResult = { dehydratedState: DehydratedState };

/*
 * To return a dehydratedState from a loader() function.
 */
export async function prefetchQueries(
  queryClient: QueryClient,
  queries: ReadonlyArray<TrpcQueryOptions>,
): Promise<PrefetchLoaderResult> {
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
 * Get dehydrated queries to pass in the HydrationBoundary component.
 */
export function useDehydratedState() {
  function isPrefetchLoader(
    match: UIMatch<unknown>,
  ): match is UIMatch<PrefetchLoaderResult> {
    return (match.loaderData as PrefetchLoaderResult|undefined)?.dehydratedState != null;
  }

  const matches = useMatches();
  return useMemo<DehydratedState>(() => {
    const queries = matches.flatMap((match) => {
      if (isPrefetchLoader(match) && match.loaderData?.dehydratedState) {
        return match.loaderData.dehydratedState.queries;
      }
      return [];
    });
    return { queries, mutations: [] };
  }, [matches]);
}
