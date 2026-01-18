import { Ionicons } from '@expo/vector-icons'
import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import InputForm from '../../components/auth/inputForm'

export default function Login() {
    const router = useRouter()
    const { t } = useTranslation();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace("/verify"); // ✅ correct navigation
        }, 6000);

        return () => clearTimeout(timeout);
    }, [router]);
    return (
        <SafeAreaView className="flex-1   ">

            <View className="w-full flex-1 px-3 py-2 bg-gray-300/50">
                <View className=" w-full flex-row items-center justify-between mb-10 mt-3">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-white w-10 h-10 items-center justify-center rounded-full">

                        <Ionicons name={t("icon")} size={24} color="black" />
                    </TouchableOpacity>

                    <Text className="text-[16px] font-bold text-black capitalize text-center">{t('login')}</Text>
                    <TouchableOpacity className="bg-transparent w-10 h-10 items-center justify-center rounded-full">

                        {/* <Ionicons name="language" size={24} color="black" /> */}
                    </TouchableOpacity>
                </View>

                <View className=" items-center">
                    {/* <View className="bg-yellow-200/89 w-[70px] h-[70px]  items-center justify-center rounded-full p-10">
                        <Feather name="message-circle" size={24} color="black" />

                    </View> */}
                    <View className="my-10 px-5">
                        <Text className="text-4xl font-bold text-black capitalize text-center"   >
                            {t('login_title')}
                        </Text>
                        <Text className="text-center text-slate-500 mt-3 text-base leading-6 px-4">
                            {t('login_subtitle')}
                        </Text>
                    </View>
                </View>
                <InputForm className="  mt-10" />
                <View className="mb-10 px-5">
                    <TouchableOpacity
                        // onPress={() => router.push("/login")}
                        className="bg-yellow-400 rounded-full py-4 mb-4">
                        <Text className="text-center text-black font-semibold text-lg">
                            {t('login_button')}
                        </Text>
                        <Ionicons name={t("icon")} size={24} color="black" className="absolute right-4 top-4" />
                    </TouchableOpacity>

                    <Text className="text-center text-sm text-slate-400 px-6">
                        {t('login_privacy')}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    )
}