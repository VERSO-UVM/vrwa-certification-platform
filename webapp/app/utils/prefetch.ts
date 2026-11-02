import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { ClientLoaderFunctionArgs, Params } from "react-router";
import type { AppRouter } from "@backend/routers";
import { getQueryClient } from "~/utils/query-client";
import {
  getBrowserTrpcClient,
  type QueryListFn,
} from "./trpc";

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
