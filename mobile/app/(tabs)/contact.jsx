import { View, FlatList } from "react-native";
import { GetAllUser } from "../../store/transtack/query";
import FetchUsers from "../../components/users/FetchUsers";
export default function Contacts() {
    // const [page, setPage] = React.useState(1);
    const { data, error } = GetAllUser();

    console.log(data);
    console.log(error);

    return (
        <View className="flex-1 bg-gray-50">
            <FlatList
                data={data}
                renderItem={({ item }) => <FetchUsers item={item} />}
                keyExtractor={(item) => item._id}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
            />

        </View>
    );
}