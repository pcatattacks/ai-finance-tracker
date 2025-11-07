/**
 * Query Provider
 *
 * Provides TanStack Query (React Query) context for server state management.
 * WHY: TanStack Query handles caching, refetching, and optimistic updates
 * for all our API calls, making the app feel fast and responsive.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a client instance
  // We use useState to ensure the client is only created once
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: How long data is considered fresh (5 minutes)
            staleTime: 5 * 60 * 1000,
            // Cache time: How long inactive data stays in cache (10 minutes)
            gcTime: 10 * 60 * 1000,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
