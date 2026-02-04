import { View, FlatList, RefreshControl, Text } from "react-native";
import { useGetAllUsers } from "../../store/transtack/query";
import FetchUsers from "../../components/users/FetchUsers";
import { useLayoutEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SocketIoStore } from "../../store/socketioStore";

export default function Contacts() {
    const [searchValue, setSearchValue] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const { data = [], error, refetch, isLoading } = useGetAllUsers();
    const navigation = useNavigation();
    const onlineUsers = SocketIoStore((state) => state.onlineUsers) || [];
    const isConnect = SocketIoStore((state) => state.isConnect);

    console.log("socket is connected finaly", isConnect);

    // Pull to refresh
    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await refetch();
        } finally {
            setRefreshing(false);
        }
    };

    // Header search
    useLayoutEffect(() => {
        navigation.setOptions({
            headerSearchBarOptions: {
                hidesWhenScrolling: true,
                placeholder: "Search users...",
                textColor: "#111827",
                hintTextColor: "#9CA3AF",
                headerIconColor: "#3B82F6",
                onChangeText: (event) => {
                    setSearchValue(event.nativeEvent.text);
                },
            },
        });
    }, [navigation]);

    // Filter users
    const filteredData = Array.isArray(data)
        ? data.filter((item) =>
            item?.FullName?.toLowerCase().includes(searchValue.toLowerCase())
        )
        : [];


    if (!isLoading && filteredData.length === 0) {
        return (
            <View className="flex-1 items-center mt-10">
                <Ionicons name="person" size={50} color="#b88144" />
                <Text className="text-center font-bold text-xl text-slate-800">No User Found</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View className="flex-1 items-center mt-10">
                <Ionicons name="warning" size={50} color="#b88144" />
                <Text className="text-center font-bold text-2xl mb-6 text-slate-800">
                    Something went wrong
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item?._id?.toString()}
                renderItem={({ item }) => (
                    <FetchUsers
                        item={item}
                        online={Array.isArray(onlineUsers) && onlineUsers?.includes(item?._id)}
                    />
                )}
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
        </View>
    );
}
