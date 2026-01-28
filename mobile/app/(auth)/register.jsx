import { Ionicons } from "@expo/vector-icons";
import {
    View,
    Text,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import InputForm from "../../components/auth/inputForm";

export default function Login() {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}
            className="flex-1 bg-gray-300/50"
        >
            <SafeAreaView className="flex-1 bg-gray-300/50">
                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{ flexGrow: 1 }}
                    showsVerticalScrollIndicator={false}
                >


                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={{ flex: 1 }}
                    >
                        <View className="w-full flex-row items-center justify-between mb-6 mt-3 px-3 ">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="bg-white w-10 h-10 items-center justify-center rounded-full"
                            >
                                <Ionicons name={t("icon")} size={24} color="black" />
                            </TouchableOpacity>

                            <Text className="text-[16px] font-bold text-black capitalize">
                                {t("login")}
                            </Text>

                            <View className="w-10 h-10" />
                        </View>

                        {/* BODY (keyboard aware) */}


                        <View className="flex-1 px-3">
                            <View className="items-center">
                                <View className="my-10 px-5">
                                    <Text className="text-4xl font-bold text-black text-center">
                                        {t("login_title")}
                                    </Text>
                                    <Text className="text-center text-slate-500 mt-3 text-base leading-6 px-4">
                                        {t("login_subtitle")}
                                    </Text>
                                </View>
                            </View>

                            <InputForm className="mt-10" />
                        </View>
                    </KeyboardAvoidingView >
                </ScrollView>
            </SafeAreaView>
        </TouchableWithoutFeedback >
    );
}
