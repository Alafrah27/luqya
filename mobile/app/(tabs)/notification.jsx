import { View, Text, FlatList, RefreshControl, ActivityIndicator } from "react-native";
import { useGetNotifications } from "../../store/transtack/query";
import FetchRequestNotification from "../../components/users/fetchRequestNotification";
import { useCallback, useState } from "react";
import { SocketIoStore } from "../../store/socketioStore";

export default function Notification() {
    const [refreshing, setRefreshing] = useState(false);

    // All hooks must stay at the top
    const onlineUsers = SocketIoStore((state) => state?.onlineUsers) || [];
    const { notification, refetch, error, isLoading } = useGetNotifications();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    }, [refetch]);

    // Instead of early returns, we render the UI conditionally inside the main return
    return (
        <View className="flex-1 bg-gray-50">
            {isLoading ? (
                <View className="flex-1 items-center justify-center bg-white">
                    <ActivityIndicator size="large" color="#b88144" />
                    <Text className="mt-2 text-gray-500">Loading...</Text>
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-red-500">Error fetching notifications</Text>
                </View>
            ) : (
                <FlatList
                    data={Array.isArray(notification) ? notification : []}
                    keyExtractor={(item, index) => item?._id?.toString() || index.toString()}
                    renderItem={({ item }) => {
                        // Only render if item and sender exist
                        if (!item || !item.sender) return null;
                        return (
                            <FetchRequestNotification
                                item={item}
                                online={Array.isArray(onlineUsers) && onlineUsers.includes(item?.sender?._id)}
                            />
                        );
                    }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-20">
                            <Text className="text-gray-500">No new notifications</Text>
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
                    windowSize={5}
                />
            )}
        </View>
    );
}