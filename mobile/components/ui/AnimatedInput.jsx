import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const AnimatedInput = ({
    icon,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default',
    index = 0,
    isPassword = false,
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 150).duration(600).springify()}
            className="flex-row align-center w-full bg-gray-300/30 space-x-3 border border-slate-200 rounded-full px-4 py-3 items-center mb-5 gap-3"
        >
            <Ionicons name={icon} size={20} color="#b88144" />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                secureTextEntry={isPassword ? !isPasswordVisible : secureTextEntry}
                className="flex-1 py-2 shrink placeholder:text-slate-400 placeholder:text-sm"
            />
            {isPassword && (
                <Ionicons
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={16}
                    color="#b88144"
                />
            )}
        </Animated.View>
    );
};

export default AnimatedInput;
