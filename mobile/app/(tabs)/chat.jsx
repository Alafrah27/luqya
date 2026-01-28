import { View, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
import { useContextProvider } from "../../context/LngContext";
import { useAuthStore } from "../../store/Store";
export default function Chat() {



    return (
        <SafeAreaView className="flex-1 py-0" >

            <View >
                <Text>Chat Screen</Text>

            </View>
        </SafeAreaView>
    )
}