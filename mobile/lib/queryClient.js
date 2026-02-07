import { QueryClient } from "@tanstack/react-query";
import { captureQueryError, addBreadcrumb } from "./sentry";

/**
 * Global error handler for React Query
 * Captures all query/mutation errors to Sentry
 */
function handleQueryError(error, query) {
  // Defensive check - query might be undefined in some edge cases
  if (!query) return;

  const queryKey = query?.queryKey || ["unknown"];

  // Add breadcrumb
  addBreadcrumb("react-query", `Query failed: ${JSON.stringify(queryKey)}`, {
    queryKey: queryKey,
    error: error?.message,
  });

  // Capture to Sentry
  captureQueryError(error, {
    queryKey: queryKey,
    queryHash: query?.queryHash,
  });
}

/**
 * Global error handler for mutations
 */
function handleMutationError(error, variables, context, mutation) {
  // Defensive check
  if (!mutation) return;

  const mutationKey = mutation?.options?.mutationKey || ["mutation"];

  addBreadcrumb("react-query", "Mutation failed", {
    mutationKey: mutationKey,
    error: error?.message,
  });

  captureQueryError(error, {
    queryKey: mutationKey,
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60, // 1 minute
    },
    mutations: {
      // Global mutation error handler
      onError: handleMutationError,
    },
  },
});

/**
 * Set up global query cache error listener
 * This catches ALL query errors application-wide
 */
queryClient.getQueryCache().config.onError = handleQueryError;
