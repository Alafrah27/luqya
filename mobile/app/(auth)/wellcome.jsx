import { View, Text, Image, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";


export default function Wellcome() {
    const router = useRouter()
    const { t } = useTranslation()
    const handleRoute = () => {
        router.replace("/login")
    }
    return (
        <SafeAreaView className="flex-1 bg-gray-300/50">
            <View className="flex-1 px-6 justify-between">

                {/* 🔹 TOP / HERO */}
                <View className="items-center mt-10">
                    <Image
                        source={require("@/assets/images/icon.png")}
                        className="w-[180] h-[180] rounded-full "
                    />

                    <Text className="text-3xl font-extrabold text-black">
                        {t('app_name')}
                    </Text>
                    {/* //لُقيا */}
                    <Text className="text-center text-slate-500 mt-3 text-base leading-6 px-4 font-medium">
                        {t('app_description')}
                    </Text>
                </View>

                {/* 🔹 BOTTOM / ACTION */}
                <View className="mb-10">
                    <TouchableOpacity
                        onPress={handleRoute}
                        className="bg-[#b88144] rounded-full py-4 mb-4">
                        <Text className="text-center text-black font-semibold text-lg shadow-md">
                            {t('start_button')}
                        </Text>
                    </TouchableOpacity>

                    <Text className="text-center text-xs text-slate-400 px-6">
                        {t('privacy_policy')}

                    </Text>


                </View>

            </View>
        </SafeAreaView>
    );
}


