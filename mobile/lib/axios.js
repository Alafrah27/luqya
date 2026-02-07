import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { captureApiError, addBreadcrumb } from "./sentry";

const instance = axios.create({
  baseURL: "https://luqya.onrender.com/api/v1",
  timeout: 20000, // Increased timeout; 1000ms is very short for a free Render instance
  headers: { "Content-Type": "application/json" },
});

/** 1. REQUEST INTERCEPTOR: Inject Token + Add Breadcrumb */
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add breadcrumb for API request
    addBreadcrumb("http", `${config.method?.toUpperCase()} ${config.url}`, {
      method: config.method,
      url: config.url,
    });

    return config;
  },
  (error) => Promise.reject(error),
);

/** 2. RESPONSE INTERCEPTOR: Capture API Errors to Sentry */
instance.interceptors.response.use(
  // Success - pass through
  (response) => response,

  // Error - capture to Sentry
  (error) => {
    const config = error.config || {};
    const status = error.response?.status;

    // Don't capture 401 (unauthorized) - these are expected
    // Don't capture network errors in development
    const shouldCapture = status && status !== 401;

    if (shouldCapture) {
      captureApiError(error, {
        url: config.url,
        method: config.method?.toUpperCase(),
        status: status,
        responseData: error.response?.data,
      });
    }

    // Still reject so the calling code can handle it
    return Promise.reject(error);
  },
);

export default instance;
