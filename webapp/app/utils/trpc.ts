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

/* Handle for TRPC */
export type TRPC = ReturnType<typeof useTRPC>;

/* unknown doesn't work here, but we don't care about the type of query */
export type TrpcQueryOptions = FetchQueryOptions<any, any, any, any>;

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

export function getTrpcClient() {
  if (typeof window === "undefined") {
    // Server: fresh client on each request
    return makeTrpcClient();
  }
  // Browser: make a new client if we don't have one
  if (!browserTrpcClient) {
    browserTrpcClient = makeTrpcClient();
  }
  return browserTrpcClient;
}
