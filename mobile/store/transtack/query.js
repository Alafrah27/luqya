import { useQuery } from "@tanstack/react-query";
import instance from "../../lib/axios";

export const GetAllUser = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await instance.get("/users/all-users");

      console.log("API RESPONSE:", res.data); // 👈 ADD THIS

      return res.data;
    },
    retry: false,
  });

  console.log("REACT QUERY DATA:", data); // 👈 ADD THIS

  return { data, isLoading, error };
};
