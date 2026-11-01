import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@backend/routers";
import {
  createTRPCClient,
  httpBatchStreamLink,
  type HTTPHeaders,
} from "@trpc/client";
import { getTrpcUrl } from "./env";
import SuperJSON from "superjson";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();
export type { AppRouter };

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
