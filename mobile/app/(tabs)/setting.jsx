import { View, Text } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'
export default function Setting() {
    return (
        <SafeAreaView className="flex-1" >

            <View  className="flex-1 items-center justify-center">
                <Text>Setting Screen</Text>
            </View>
        </SafeAreaView>
    )
}