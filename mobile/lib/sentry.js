/**
 * Sentry Configuration Module for Luqya Chat App
 *
 * Centralized error tracking configuration with helper functions for:
 * - Initialization with all integrations
 * - User context management
 * - Error capture wrappers
 * - Breadcrumb helpers
 */

import * as Sentry from "@sentry/react-native";

// Sentry DSN - Your project's unique identifier
const SENTRY_DSN =
  "https://90f8fe315ef0220e28ae091e8438cea5@o4510845592141824.ingest.de.sentry.io/4510845598171216";

/**
 * Safely stringify data, truncating large values
 * Prevents issues with large base64 strings
 */
function safeStringify(value, maxLength = 500) {
  try {
    if (value === null || value === undefined) return String(value);
    const str = typeof value === "string" ? value : JSON.stringify(value);
    if (str && str.length > maxLength) {
      return str.substring(0, maxLength) + "...[truncated]";
    }
    return str;
  } catch {
    return "[Unable to stringify]";
  }
}

/**
 * Initialize Sentry with production-grade configuration
 * Call this at app startup before any other code
 */
export function initSentry() {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Send PII for better user context (IP, cookies, user info)
    sendDefaultPii: true,

    // Enable Sentry Logs for debugging
    enableLogs: true,

    // Environment tag for filtering in dashboard
    environment: __DEV__ ? "development" : "production",

    // Sample rates for performance/errors
    tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% in production

    // Session Replay configuration
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% when error occurs

    // Enable performance monitoring
    enableAutoPerformanceTracing: true,

    // Integrations for mobile
    integrations: [
      Sentry.mobileReplayIntegration(),
      Sentry.feedbackIntegration(),
      // HTTP breadcrumbs are auto-captured
    ],

    // Filter out non-critical errors in development
    beforeSend(event, hint) {
      try {
        // Skip certain errors in development
        if (__DEV__) {
          const message = event?.exception?.values?.[0]?.value || "";
          // Skip network errors during dev (common with hot reload)
          if (
            typeof message === "string" &&
            message.includes("Network request failed")
          ) {
            return null;
          }
        }
        return event;
      } catch {
        // If anything fails in beforeSend, still send the event
        return event;
      }
    },

    // Enable Spotlight for local development debugging
    // spotlight: __DEV__,
  });
}

/**
 * Set user context after successful login
 * @param {Object} user - User object with id, email, fullName
 */
export function setSentryUser(user) {
  if (!user) return;

  try {
    Sentry.setUser({
      id: user._id || user.id || "unknown",
      email: user.email || user.Email || "",
      username: user.FullName || user.fullName || "",
    });

    // Add extra user tags for filtering
    Sentry.setTag("user.authenticated", "true");
  } catch {
    // Silently fail - don't crash the app for Sentry issues
  }
}

/**
 * Clear user context on logout
 */
export function clearSentryUser() {
  try {
    Sentry.setUser(null);
    Sentry.setTag("user.authenticated", "false");
  } catch {
    // Silently fail
  }
}

/**
 * Capture API/network errors with context
 * @param {Error} error - The error object
 * @param {Object} context - Additional context (url, method, status)
 */
export function captureApiError(error, context = {}) {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("error.type", "api");
      scope.setTag("api.url", context?.url || "unknown");
      scope.setTag("api.method", context?.method || "unknown");
      scope.setTag("api.status", String(context?.status || "unknown"));

      // Truncate response data to avoid huge payloads (like base64 images)
      scope.setContext("API Request", {
        url: context?.url,
        method: context?.method,
        status: context?.status,
        responseData: safeStringify(context?.responseData, 200),
      });

      Sentry.captureException(error);
    });
  } catch {
    // Silently fail
  }
}

/**
 * Capture Socket.IO errors with context
 * @param {Error} error - The error object
 * @param {Object} context - Additional context (event, data)
 */
export function captureSocketError(error, context = {}) {
  try {
    Sentry.withScope((scope) => {
      scope.setTag("error.type", "socket");
      scope.setTag("socket.event", context?.event || "unknown");

      scope.setContext("Socket.IO", {
        event: context?.event,
        data: safeStringify(context?.data, 200),
        connected: context?.connected,
      });

      Sentry.captureException(error);
    });
  } catch {
    // Silently fail
  }
}

/**
 * Capture React Query errors
 * @param {Error} error - The error object
 * @param {Object} query - Query details (queryKey, etc)
 */
export function captureQueryError(error, query = {}) {
  try {
    const queryKey = query?.queryKey || [];

    Sentry.withScope((scope) => {
      scope.setTag("error.type", "react-query");
      scope.setTag("query.key", safeStringify(queryKey, 100));

      scope.setContext("React Query", {
        queryKey: safeStringify(queryKey, 100),
        queryHash: query?.queryHash || "unknown",
      });

      Sentry.captureException(error);
    });
  } catch {
    // Silently fail
  }
}

/**
 * Add navigation breadcrumb
 * @param {string} routeName - Current route name
 * @param {Object} params - Route parameters
 */
export function addNavigationBreadcrumb(routeName, params = {}) {
  try {
    Sentry.addBreadcrumb({
      category: "navigation",
      message: `Navigated to ${routeName || "unknown"}`,
      level: "info",
      data: params || {},
    });
  } catch {
    // Silently fail
  }
}

/**
 * Add custom action breadcrumb
 * @param {string} category - Category (ui, socket, auth, etc)
 * @param {string} message - Description of the action
 * @param {Object} data - Additional data
 */
export function addBreadcrumb(category, message, data = {}) {
  try {
    Sentry.addBreadcrumb({
      category: category || "general",
      message: message || "",
      level: "info",
      data: data || {},
    });
  } catch {
    // Silently fail
  }
}

/**
 * Manually capture an exception with optional context
 * @param {Error} error - The error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  try {
    Sentry.withScope((scope) => {
      if (context?.tags && typeof context.tags === "object") {
        Object.entries(context.tags).forEach(([key, value]) => {
          if (key && value !== undefined) {
            scope.setTag(String(key), String(value));
          }
        });
      }

      if (context?.extra && typeof context.extra === "object") {
        // Truncate extra data to avoid huge payloads
        const safeExtra = {};
        Object.entries(context.extra).forEach(([key, value]) => {
          safeExtra[key] = safeStringify(value, 200);
        });
        scope.setExtras(safeExtra);
      }

      if (context?.level) {
        scope.setLevel(context.level);
      }

      Sentry.captureException(error);
    });
  } catch {
    // Silently fail
  }
}

/**
 * Capture a message (non-error event)
 * @param {string} message - The message to capture
 * @param {string} level - Severity level (info, warning, error)
 */
export function captureMessage(message, level = "info") {
  try {
    Sentry.captureMessage(message || "", level);
  } catch {
    // Silently fail
  }
}

// Re-export Sentry for direct access when needed
export { Sentry };
