import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const instance = axios.create({
  baseURL: "https://luqya.onrender.com/api/v1",
  timeout: 15000, // Increased timeout; 1000ms is very short for a free Render instance
  headers: { "Content-Type": "application/json" },
});

/** 1. REQUEST INTERCEPTOR: Inject Token */
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/** 2. RESPONSE INTERCEPTOR: Handle Retries & Auth Errors */
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    // --- A. HANDLE EXPIRED TOKEN (401) ---
    if (response && response.status === 401) {
      const router = useRouter();
      console.log("Token expired. Cleaning up...");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");

      router.replace("/login");

      return Promise.reject(new Error("Session expired. Please login again."));
    }

    // --- B. HANDLE WEAK INTERNET (Retries) ---
    const MAX_RETRIES = 2;
    config._retryCount = config._retryCount || 0;

    const isNetworkError = !response; // No response = signal dropped
    const isTimeout = error.code === "ECONNABORTED"; // Request took too long

    if ((isNetworkError || isTimeout) && config._retryCount < MAX_RETRIES) {
      config._retryCount += 1;

      // Delay before retrying: 2s, then 4s
      const delay = config._retryCount * 2000;
      await new Promise((resolve) => setTimeout(resolve, delay));

      console.log(`Retrying due to weak signal... (${config._retryCount})`);
      return instance(config);
    }

    return Promise.reject(error);
  },
);

export default instance;
