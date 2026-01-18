
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'

export default function VerifyForm() {
    const { t } = useTranslation();
    return (
        <View className="flex-1 justify-between mt-6">
            <View className="px-2 h-14 text-center">
                <TextInput
                    className="flex-1 border border-gray-300 rounded-full px-5 py-2 text-base text-gray-700 text-center"
                    placeholder={t('verify_placeholder')}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                />
            </View>
            <View className="mb-10 px-5">
                <TouchableOpacity
                    // onPress={() => router.push("/login")}
                    className="bg-yellow-400 rounded-full py-4 mb-4">
                    <Text className="text-center text-black font-semibold text-lg">
                        {t('verify_button')}
                    </Text>
                </TouchableOpacity>

                <Text className="text-center text-sm text-slate-400 px-6">
                    {t('login_privacy')}
                </Text>
            </View>
        </View>
    )
}