import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/routers";
import {
  createTRPCClient,
  httpBatchStreamLink,
  type HTTPHeaders,
  type TRPCClient,
} from "@trpc/client";
import type { FetchQueryOptions } from "@tanstack/react-query";
import type { Params } from "react-router";
import { getTrpcUrl } from "./env";
import SuperJSON from "superjson";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
export type { AppRouter };

/* Handle for TRPC to do e.g. `trpc.courses.admin.get.queryOptions()`*/
export type TRPC = ReturnType<typeof useTRPC>;

/* unknown doesn't work here, but we don't care about the type of query */
export type TrpcQueryOptions = FetchQueryOptions<any, any, any, any>;

/**
 * Shared query-list shape for server and client prefetch loaders.
 * Declaring only (trpc, params) still satisfies this type.
 */
export type QueryListFn<P extends Params> = (
  trpc: TRPC,
  params: P,
  searchParams: URLSearchParams,
) => ReadonlyArray<TrpcQueryOptions>;

/**
 * Helper to ensure that server and browser tRPC clients have
 * matching configurations.
 */
export const makeTrpcClient = (headers?: HTTPHeaders) => {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchStreamLink({
        headers,
        url: getTrpcUrl(),
        transformer: SuperJSON,
        fetch(url, options) {
          // Use regular JS fetch() and make sure to pass
          // all headers and credentials
          return fetch(url, {
            ...options,
            credentials: "include",
          });
        },
      }),
    ],
  });
};

let browserTrpcClient: TRPCClient<AppRouter> | undefined;

/**
 * Singleton browser tRPC client shared by Layout and clientLoaders.
 */
export function getBrowserTrpcClient() {
  if (typeof window === "undefined") {
    throw new Error("getBrowserTrpcClient() is only available in the browser");
  }
  if (!browserTrpcClient) {
    browserTrpcClient = makeTrpcClient();
  }
  return browserTrpcClient;
}
