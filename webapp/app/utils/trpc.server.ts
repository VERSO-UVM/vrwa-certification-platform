import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { LoaderFunctionArgs, Params } from "react-router";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/root";
import { makeTrpcClient, type TRPC } from "./trpc";
import {
  dehydrate,
  QueryClient,
  type FetchQueryOptions,
} from "@tanstack/react-query";

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

/* unknown doesn't work here, but we don't care about the type of query */
type TrpcQueryOptions = FetchQueryOptions<any, any, any, any>;

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
export function prefetchLoader<T extends Params>(
  queryListFn: (trpc: TRPC, params: T) => ReadonlyArray<TrpcQueryOptions>,
) {
  return async ({ request, params }: LoaderFunctionArgs) => {
    const [queryClient, trpc] = getServerTrpc(request);
    return await prefetchQueries(queryClient, queryListFn(trpc, params as T));
  };
}
