import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useGetNotifications } from "../../store/transtack/query";
import FetchRequestNotification from "../../components/users/fetchRequestNotification";
import { useCallback, useState, useMemo, useEffect } from "react";
import { SocketIoStore } from "../../store/socketioStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Notification() {
    const [refreshing, setRefreshing] = useState(false);
    const [localCache, setLocalCache] = useState([]);

    // 1. Get online users from Zustand
    const onlineUsersRaw = SocketIoStore((state) => state?.onlineUsers);
    const onlineUsers = useMemo(() => Array.isArray(onlineUsersRaw) ? onlineUsersRaw : [], [onlineUsersRaw]);

    // 2. Get notifications from Hook
    const { notification, refetch, error, isLoading, isFetching } = useGetNotifications();

    // 3. Load cache manually on first mount to prevent "No Data" flash
    useEffect(() => {
        const loadCache = async () => {
            const cached = await AsyncStorage.getItem("notification_cache");
            if (cached) setLocalCache(JSON.parse(cached));
        };
        loadCache();
    }, []);

    // 4. Combine Server Data and Local Cache
    // If notification is undefined (still loading), use localCache
    // 1. Combine Server Data and Local Cache correctly
    const safeData = useMemo(() => {
        // If we have actual data from the server, use it
        if (notification && notification.length > 0) return notification;

        // If server is empty but we have cache, use cache
        if ((!notification || notification.length === 0) && localCache.length > 0) return localCache;

        // Default to empty array
        return [];
    }, [notification, localCache]);

    // 2. The "True" Loading Logic
    // We only show "No New Requests" if:
    // - We are NOT loading
    // - The server actually returned an empty array
    // - The cache is empty
    // const isReallyEmpty = !isLoading && !isFetching && safeData.length === 0;

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await refetch();
        } finally {
            setRefreshing(false);
        }
    }, [refetch]);

    // Only show the ActivityIndicator if we have NO cache and NO network data
    const showInitialLoading = isLoading && safeData.length === 0;

    return (
        <View className="flex-1 bg-gray-50">
            {showInitialLoading ? (
                <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#b88144" />
                    <Text className="mt-2 text-gray-500">Connecting...</Text>
                </View>
            ) : error && safeData.length === 0 ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500 font-semibold">Could not connect to server</Text>
                    <Text className="text-gray-400 text-xs mt-1" onPress={() => refetch()}>Tap to retry</Text>
                </View>
            ) : (
                <View className="flex-1">
                    {/* Tiny indicator if background fetching is happening */}
                    {isFetching && !refreshing && safeData.length > 0 && (
                        <View className="absolute top-0 left-0 right-0 z-10 bg-[#b88144]/10 py-1">
                            <Text className="text-center text-[10px] text-[#b88144]">Syncing...</Text>
                        </View>
                    )}

                    <FlatList
                        data={safeData}
                        keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
                        renderItem={({ item }) => {
                            if (!item?.sender) return null;
                            return (
                                <FetchRequestNotification
                                    item={item}
                                    online={onlineUsers.includes(item.sender._id)}
                                />
                            );
                        }}
                        ListEmptyComponent={
                            <View className="flex-1 items-center justify-center py-20">
                                <Text className="text-gray-500 text-base">No new friend requests</Text>
                                <Text className="text-gray-400 text-xs mt-1">Pull down to refresh</Text>
                            </View>
                        }
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                colors={["#b88144"]}
                                tintColor="#b88144"
                            />
                        }
                        initialNumToRender={10}
                        maxToRenderPerBatch={10}
                    />
                </View>
            )}
        </View>
    );
}