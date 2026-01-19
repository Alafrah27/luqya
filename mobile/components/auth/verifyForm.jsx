
import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { use, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useContextProvider } from '../../context/LngContext';

export default function VerifyForm() {
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { t } = useTranslation();
    const { expoPushToken } = useContextProvider();
    const handleLogin = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            alert(t('invalid_email'));
            return;
        }

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!passwordRegex.test(password)) {
            alert(t('invalid_password'));
            return;
        }

        const data = {
            email,
            password,
            Expopushtoken: expoPushToken

        };

        console.log(data);
    }
    return (
        <View className="flex-1 justify-center items-center px-3">

            <View>

                <View
                    className="flex-row align-center
                  w-full bg-gray-300/30 space-x-3
                   border border-slate-200
                    rounded-full px-4 py-3
                     items-center mb-6 gap-3">
                    <Ionicons name="mail-outline" size={20} color="#b88144" />
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('input_email')}
                        keyboardType="email-address"
                        className="flex-1 text-black py-2 shrink placeholder:text-slate-400 placeholder:text-sm"

                    />
                </View>
                <View
                    className="flex-row justify-between align-center
                               w-full bg-gray-300/30 space-x-3
                                border border-slate-200
                                 rounded-full px-4 py-3
                                  items-center mb-6 gap-3 ">

                    <View className="flex-row align-center flex-1 gap-3" >

                        <Ionicons name="lock-closed-outline" size={20} color="#b88144" />
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!isPasswordVisible}
                            placeholder={t('input_password')}
                            keyboardType="password"
                            className="flex-1 text-black py-2 shrink placeholder:text-slate-400 placeholder:text-sm"

                        />
                    </View>
                    <Ionicons
                        className="z-10"
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        name={isPasswordVisible ? "eye-off" : "eye"} size={16} color="#b88144" />
                </View>
            </View>


            <View className="mt-10 absolute bottom-8 w-full space-y-10 justify-center items-center">
                <TouchableOpacity
                    onPress={handleLogin}
                    className="bg-[#b88144] w-full rounded-full py-4 px-10 flex-row items-center space-x-3 shadow-md mb-4">
                    <Text className="text-center text-black font-semibold text-lg flex-1">
                        {t('login_now')}
                    </Text>
                </TouchableOpacity>
                <Link href="/register" className="text-center text-xs text-slate-400 px-10 leading-5">
                    {t('ihave_account')} <Text className="text-[#b88144] font-semibold">Sign up</Text>
                </Link>
            </View>
        </View>

    )
}