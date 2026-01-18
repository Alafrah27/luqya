
import { View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import VerifyForm from '../../components/auth/verifyForm'
export default function Verify() {
    const { t } = useTranslation();
    const router = useRouter()
    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>


            <SafeAreaView className="flex-1 bg-gray-300/50 ">
                <View className="px-4 py-2 flex-1">
                    <View className=" w-full flex-row items-center justify-between mb-10 mt-3">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-white w-10 h-10 items-center justify-center rounded-full">

                            <Ionicons name={t("icon")} size={24} color="black" />
                        </TouchableOpacity>

                        <Text className="text-[16px] font-bold text-black capitalize text-center"></Text>
                        <TouchableOpacity className="bg-transparent w-10 h-10 items-center justify-center rounded-full">

                            {/* <Ionicons name="language" size={24} color="black" /> */}
                        </TouchableOpacity>
                    </View>

                    {/* verify introduction title */}
                    <View className=" items-center mt-14">
                        <Text className="text-4xl font-bold text-black capitalize text-center">
                            {t('verify_title')}
                        </Text>
                        <Text className="text-center text-slate-500 mt-3 text-base leading-6 px-4 font-bold">
                            {t('verify_subtitle')}
                        </Text>
                        <Text className="text-center text-slate-500 mt-3 text-base leading-6 px-4 font-bold">
                            (+966555475591)
                        </Text>
                    </View>

                    {/* input verify component */}
                    <VerifyForm />
                </View>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    )
}