import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
  return useMutation({
    mutationFn: async (id) => {
      const res = await instance.post(`/friend/send-request/${id}`);
      return res.data;
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await instance.post(`/friend/accept-request/${id}`);
      return res.data;
    },
    onSuccess: () => {
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
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["notification"]);
    },
  });
};
