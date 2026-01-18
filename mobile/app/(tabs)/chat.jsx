import { View, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useContextProvider } from "../../context/LngContext";
export default function Chat() {
    const { expoPushToken, error } = useContextProvider();
    if(error){
        return (
            <SafeAreaView className="flex-1" >

                <View className="flex-1 items-center justify-center">
                    <Text>{error}</Text>
                </View>
            </SafeAreaView>
        )
    }
    return (
        <SafeAreaView className="flex-1" >

            <View className="flex-1 items-center justify-center">
                <Text>{expoPushToken}</Text>
            </View>
        </SafeAreaView>
    )
}