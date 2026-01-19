import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
} from 'react-native';

import { useRouter, Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useContextProvider } from '../../context/LngContext';
import { useAuthStore } from '../../store/Store';


const InputForm = () => {
    const [email, setEmail] = useState('');
    const [FullName, setFullName] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const { t } = useTranslation();
    const { expoPushToken } = useContextProvider()
    const register = useAuthStore((state) => state.register);
    const isLoading = useAuthStore((state) => state.isLoading);
    const router = useRouter()
    const handleRegister = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

        if (!emailRegex.test(email)) return alert(t('invalid_email'));
        if (!passwordRegex.test(password)) return alert(t('invalid_password'));
        if (!FullName || FullName.length < 3) return alert("Invalid Name");

        // 2. Data Preparation
        const data = {
            FullName,
            email,
            password,
            Expopushtoken: expoPushToken // Ensure this exists from your hook
        };

        // 3. Execution
        const result = await register(data);

        if (result.success) {
            // Redirect to home or chat screen
            router.replace("/(tabs)");
        } else {
            // Show server error (e.g., "User already exists")
            alert(result.message);
        }
    };

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
                        value={FullName}
                        onChangeText={(text) => setFullName(text)}
                        placeholder={t('input_name')}
                        keyboardType="default"
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
                        value={email}
                        onChangeText={(text) => setEmail(text)}
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
                    disabled={isLoading}
                    onPress={handleRegister}
                    className="bg-[#b88144] w-full rounded-full py-4 px-10 flex-row items-center space-x-3 shadow-md mb-4">
                    <Text className="text-center text-black font-semibold text-lg flex-1">
                        {isLoading ? <ActivityIndicator color="#fff" /> : t('register_now')}

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