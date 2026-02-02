import { View, FlatList, RefreshControl, Text } from "react-native";
import { GetAllUser } from "../../store/transtack/query";
import FetchUsers from "../../components/users/FetchUsers";
import { useLayoutEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
export default function Contacts() {
    const [searchValue, setSearchValue] = useState("");
    // const [page, setPage] = React.useState(1);
    const [refresh, setRefreshing] = useState(false);
    const { data, error, refetch } = GetAllUser();
    const navigation = useNavigation();


    const onRefresh = async () => {
        try {
            setRefreshing(true);
            await refetch();

        } catch (e) {
            console.log(e);
        } finally {
            setRefreshing(false);
        }
    };

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
            }
        });

    }, [navigation])

    const filteredData = data?.filter((item) => item.FullName.toLowerCase().includes(searchValue.toLowerCase()));

    if (filteredData?.length === 0) {
        return (
            <View className="flex-1 items-center mt-10 ">
                <Ionicons name="person" size={50} color="#b88144" />
                <Text className="text-center font-bold text-2xl mb-6 text-slate-800">No User Found</Text>
            </View>
        )
    }

    if (error) {
        return (
            <View className="flex-1 items-center mt-10">
                <Ionicons name="warning" size={50} color="#b88144" />
                <Text className="text-center font-bold text-2xl mb-6 text-slate-800">{error}</Text>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={filteredData || []}
                renderItem={({ item }) => <FetchUsers item={item} />}
                keyExtractor={(item) => item._id}
                refreshControl={<RefreshControl refreshing={refresh} onRefresh={onRefresh} colors={['#b88144']}
                    tintColor={'#b88144'} />}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />

        </View>
    );
}