import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "https://luqya.onrender.com/api/v1",
  timeout: 20000, // Increased timeout; 1000ms is very short for a free Render instance
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

export default instance;
