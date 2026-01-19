import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,



} from 'react-native';


import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';


const InputForm = () => {
    const { t } = useTranslation();

    // const handleGoogleLogin = async () => {

    // };

    return (
        <View className="flex-1 justify-center items-center px-3">

            <View className="gap-0">
                <View
                    className="flex-row align-center
                  w-full bg-gray-300/30 space-x-3
                   border border-slate-200
                    rounded-full px-4 py-3
                     items-center mb-5 gap-3">
                    <Ionicons name="person-outline" size={20} color="#b88144" />
                    <TextInput
                        placeholder={t('input_name')}
                        keyboardType="email-address"
                        className="flex-1 text-black py-2 shrink placeholder:text-slate-400 placeholder:text-sm"

                    />
                </View>
                <View
                    className="flex-row align-center
                  w-full bg-gray-300/30 space-x-3
                   border border-slate-200
                    rounded-full px-4 py-3
                     items-center mb-5 gap-3">
                    <Ionicons name="mail-outline" size={20} color="#b88144" />
                    <TextInput
                        placeholder={t('input_email')}
                        keyboardType="email-address"
                        className="flex-1 text-black py-2 shrink placeholder:text-slate-400 placeholder:text-sm"

                    />
                </View>
                <View
                    className="flex-row align-center
                  w-full bg-gray-300/30 space-x-3
                   border border-slate-200
                    rounded-full px-4 py-3
                     items-center mb-6 gap-3">
                    <Ionicons name="lock-closed-outline" size={20} color="#b88144" />
                    <TextInput
                        placeholder={t('input_password')}
                        keyboardType="email-address"
                        className="flex-1 text-black py-2 shrink placeholder:text-slate-400 placeholder:text-sm"

                    />
                </View>
            </View>


            <View className="mt-10 absolute bottom-8 w-full space-y-10 justify-center items-center">
                <TouchableOpacity className="bg-[#b88144] w-full rounded-full py-4 px-10 flex-row items-center space-x-3 shadow-md mb-4">
                    <Text className="text-center text-black font-semibold text-lg flex-1">
                        {t('register_now')}
                    </Text>
                </TouchableOpacity>
                <Link href="/login" className="text-center text-xs text-slate-400 px-10 leading-5">
                    {t('ihaveaccount')}   <Text className="text-[#b88144]">{t('login_now')}</Text>
                </Link>
            </View>
        </View>
    );
};


// CRITICAL: This fixes the "Missing required default export" warning
export default InputForm;