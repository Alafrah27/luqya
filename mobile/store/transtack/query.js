import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import instance from "../../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useGetAllUsers = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await instance.get("/users/all-users");
      // Safety: Ensure we always return an array even if the API structure changes
      const users = res.data.users || [];
      await AsyncStorage.setItem("users", JSON.stringify(users));
      return users;
    },
    retry: false,
    // FIX: Remove the async initialData.
    // It's safer to let it be undefined and use the default value [] in the component.
  });

  return { data: data || [], isLoading, error, refetch };
};

export const useGetNotifications = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["notification"],
    queryFn: async () => {
      const res = await instance.get("/friend/request");
      // Return the full data object to match initialData structure
      const responseData = res.data || { requests: [] };

      // Save for offline use if needed (optional optimization)
      AsyncStorage.setItem(
        "notification",
        JSON.stringify(responseData.requests || []),
      );

      return responseData;
    },
    // Ensure initialData matches the info returned by queryFn (an object with requests array)
    initialData: { requests: [] },
    // Transform the data to return just the array
    select: (data) => data?.requests || [],
  });

  return {
    notification: data,
    isLoading,
    error,
    refetch,
  };
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
