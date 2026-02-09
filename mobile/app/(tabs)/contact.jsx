import { View, FlatList, RefreshControl, Text, ActivityIndicator } from "react-native";
import { useGetAllUsers } from "../../store/transtack/query";
import FetchUsers from "../../components/users/FetchUsers";
import { useLayoutEffect, useState, useMemo, useEffect, useCallback } from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SocketIoStore } from "../../store/socketioStore";
import AsyncStorage from "@react-native-async-storage/async-storage";


export default function Contacts() {
    const [searchValue, setSearchValue] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [localCache, setLocalCache] = useState([]);
    const [hasServerResponded, setHasServerResponded] = useState(false);
    const navigation = useNavigation();

    // 1. Get online status
   
    const onlineUsersRaw = SocketIoStore((state) => state?.onlineUsers);
    const onlineUsers = useMemo(() => Array.isArray(onlineUsersRaw) ? onlineUsersRaw : [], [onlineUsersRaw]);

    // 2. Fetch users hook
    const { data: serverData, error, refetch, isLoading, isFetching, isSuccess } = useGetAllUsers();

    // 3. Load cache manually on first mount
    useEffect(() => {
        const loadCache = async () => {
            const cached = await AsyncStorage.getItem("users_cache");
            if (cached) setLocalCache(JSON.parse(cached));
        };
        loadCache();
    }, []);

    // 4. CRITICAL: When server responds, update local cache to match server data
    useEffect(() => {
        if (isSuccess && serverData !== undefined) {
            setHasServerResponded(true);
            setLocalCache(serverData || []);
        }
    }, [isSuccess, serverData]);

    // 5. Determine what data to show
    const finalData = useMemo(() => {
        // If server has responded, ALWAYS use server data
        if (hasServerResponded) {
            return Array.isArray(serverData) ? serverData : [];
        }

        // If still loading and we have cache, show cache temporarily
        if (isLoading && localCache?.length > 0) {
            return localCache;
        }

        // If we have server data, use it
        if (serverData && serverData?.length > 0) {
            return serverData;
        }

        return [];
    }, [serverData, localCache, hasServerResponded, isLoading]);

    // 6. Filter the combined data
    const filteredData = useMemo(() => {
        return finalData?.filter((item) =>
            item?.FullName?.toLowerCase()?.includes(searchValue?.toLowerCase())
        );
    }, [finalData, searchValue]);

    // Pull to refresh
    const onRefresh = useCallback(async () => {
        try {
            setRefreshing(true);
            // Clear local cache before refetching
            await AsyncStorage.removeItem("users_cache");
            setLocalCache([]);
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Header search config
    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                hidesWhenScrolling: true,
                placeholder: "Search users...",
                onChangeText: (event) => setSearchValue(event.nativeEvent.text),
            },
        });
    }, [navigation]);

    // UI Logic: Only show big spinner if NO cache and NO server data
    const showInitialLoading = isLoading && finalData?.length === 0;

    if (showInitialLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#b88144" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Syncing indicator if background update is happening */}
            {isFetching && !refreshing && finalData?.length > 0 && (
                <View className="absolute top-0 left-0 right-0 z-10 bg-[#b88144]/10 py-1">
                    <Text className="text-center text-[10px] text-[#b88144]">Updating contacts...</Text>
                </View>
            )}

            <FlatList
                data={filteredData}
                keyExtractor={(item) => item?._id?.toString()}
                renderItem={({ item }) => (
                    <FetchUsers
                        item={item}
                        online={onlineUsers?.includes(item?._id)}
                    />
                )}
                ListEmptyComponent={
                    !isFetching && (
                        <View className="flex-1 items-center mt-10">
                            <Ionicons name="person-outline" size={50} color="#94a3b8" />
                            <Text className="text-center font-bold text-lg text-slate-400 mt-2">No users found</Text>
                        </View>
                    )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={["#b88144"]}
                        tintColor="#b88144"
                    />
                }
            />
        </View>
    );
}
