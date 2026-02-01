// Change this in your FetchUsers component
import { View, Text, Image } from 'react-native'
export default function FetchUsers({ item }) {
    // console.log(item) // Check if this is now showing the user object
    return (
        <View className="flex-row items-center p-3 bg-white border-b border-gray-100">

            {item?.avatar &&
                <Image
                    source={{ uri: item?.avatar }}
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                />

            }
            {/* {!item?.avatar && (
                <View>
                    <Text className="w-10 h-10 bg-gray-300 rounded-full items-center justify-center">
                        {item?.FullName?.charAt(0)}
                    </Text>
                </View>
            )} */}
            <View className="ml-3">
                {/* Add the Name so you can see who it is! */}
                <Text className="font-bold">{item?.FullName}</Text>
            </View>
        </View>
    );
}