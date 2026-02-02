import { useQuery } from "@tanstack/react-query";
import instance from "../../lib/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GetAllUser = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await instance.get("/users/all-users");
      await AsyncStorage.setItem("users", JSON.stringify(res.data.users));
      // console.log("API RESPONSE:", res.data); // 👈 ADD THIS

      return res.data.users;
    },
    retry: false,
    initialData: async () => {
      const cached = await AsyncStorage.getItem("users");
      return cached ? JSON.parse(cached) : [];
    },
  });

  // console.log("REACT QUERY DATA:", data); // 👈 ADD THIS

  return { data, isLoading, error, refetch };
};
