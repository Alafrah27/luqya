import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Helper to clear all app caches
 * Call this after mutations that affect multiple data sources
 */
export const clearAllCaches = async () => {
  try {
    await AsyncStorage.multiRemove(["notification_cache", "users_cache"]);
  } catch (error) {
    console.warn("Failed to clear caches:", error);
  }
};

/**
 * Helper to remove a specific notification from cache
 * More efficient than clearing entire cache
 */
export const removeNotificationFromCache = async (notificationId) => {
  try {
    const cached = await AsyncStorage.getItem("notification_cache");
    if (cached) {
      const notifications = JSON.parse(cached);
      const updated = notifications.filter(
        (n) => n?._id !== notificationId && n?.sender?._id !== notificationId,
      );
      await AsyncStorage.setItem("notification_cache", JSON.stringify(updated));
    }
  } catch (error) {
    console.warn("Failed to update notification cache:", error);
  }
};

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await instance.get("/users/all-users");
      const users = res.data.users || [];

      // Update the cache for the next time the app opens
      await AsyncStorage.setItem("users_cache", JSON.stringify(users));

      return users;
    },
    // This maintains the previous state while fetching fresh data
    placeholderData: (previousData) => previousData,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      // 1. Fetch from your Render backend
      const res = await instance.get("/friend/request");
      const requestData = res?.data?.requests || [];

      // 2. Save fresh data to cache for the next app launch
      await AsyncStorage.setItem(
        "notification_cache",
        JSON.stringify(requestData),
      );

      return requestData;
    },
    // 3. This is the "Offline-First" magic.
    // It looks for local data before the network request even starts.
    placeholderData: (previousData) => previousData,

    // Optional: How long the data stays "fresh" before trying to background update
    staleTime: 1000 * 60, // 1 minute
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await instance.post(`/friend/send-request/${id}`);
      return res.data;
    },
    onSuccess: async () => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries(["notification"]);
      queryClient.invalidateQueries(["users"]);
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await instance.post(`/friend/accept-request/${id}`);
      return { ...res.data, requestId: id };
    },
    onSuccess: async (data) => {
      // 1. Remove this notification from AsyncStorage cache immediately
      await removeNotificationFromCache(data?.requestId);

      // 2. Clear users cache so it refetches with new friend
      await AsyncStorage.removeItem("users_cache");

      // 3. Invalidate queries to refetch from server
      queryClient.invalidateQueries(["notification"]);
      queryClient.invalidateQueries(["users"]);
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await instance.delete(`/friend/delete-request/${id}`);
      return { ...res.data, requestId: id };
    },
    onSuccess: async (data) => {
      // 1. Remove this notification from AsyncStorage cache immediately
      await removeNotificationFromCache(data?.requestId);

      // 2. Invalidate query to refetch from server
      queryClient.invalidateQueries(["notification"]);
    },
  });
};

export const SendorGetChat = (id) => {
  return useQuery({
    queryKey: ["chat", id],
    queryFn: async () => {
      const res = await instance.post(`/chat/${id}`);
      await AsyncStorage.setItem("chat_cache", JSON.stringify(res.data));
      return res.data;
    },
  });
};

export const useSendMessage = () => {
  return useMutation({
    mutationFn: async ({ chatId, text, fileUrl, fileType }) => {
      const res = await instance.post(`/message/${chatId}`, {
        text,
        fileUrl,
        fileType,
      });
      return res.data;
    },
  });
};
