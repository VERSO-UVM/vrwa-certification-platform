import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
} from "react-router";
import {
  HydrationBoundary,
  type DehydratedState,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useMemo } from "react";

import "./app.css";
import { getQueryClient } from "~/utils/query-client";
import { getBrowserTrpcClient, makeTrpcClient, TRPCProvider } from "~/utils/trpc";
import type { Route } from "./+types/root";
import { TooltipProvider } from "./components/ui/tooltip";
import superjson from "superjson";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

const asyncStoragePersister = createAsyncStoragePersister({
  storage: typeof window !== "undefined" ? window.localStorage : undefined,
  // Serialize JavaScript types like Date correctly in caching
  serialize: superjson.stringify,
  deserialize: superjson.parse,
});

export function Layout({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  // Browser: share the singleton with clientLoaders. Server: fresh client per request.
  const trpcClient =
    typeof window === "undefined" ? makeTrpcClient() : getBrowserTrpcClient();

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <Meta />
            <Links />
          </head>
          <body className="vrwa-light">
            <TooltipProvider>{children}</TooltipProvider>
            {/* customize getKey to prevent scroll reset when URLSearchParams changes*/}
            <ScrollRestoration getKey={(location) => location.pathname} />
            <Scripts />
          </body>
        </html>
      </TRPCProvider>
      <ReactQueryDevtools />
    </PersistQueryClientProvider>
  );
}

export default function App() {
  // Merge dehydrated query state from every matched loader so layout + page
  // prefetches both apply, and always render the same tree so Outlet doesn't remount.
  const matches = useMatches();
  const dehydratedState = useMemo(() => {
    const queries: DehydratedState["queries"] = [];
    const mutations: DehydratedState["mutations"] = [];
    for (const match of matches) {
      const loaderData = match?.loaderData as
        | { dehydratedState: DehydratedState }
        | undefined;
      const state = loaderData?.dehydratedState;
      if (state) {
        queries.push(...state.queries);
        mutations.push(...state.mutations);
      }
    }
    if (queries.length === 0 && mutations.length === 0) {
      return undefined;
    }
    return { queries, mutations };
  }, [matches]);

  return (
    <HydrationBoundary state={dehydratedState}>
      <Outlet />
    </HydrationBoundary>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
