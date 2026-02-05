import { View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

// 1. Add the color logic so bgColor works
const avatarColors = ["#F87171", "#60A5FA", "#34D399", "#FBBF24", "#A78BFA", "#FB923C"];

function getColorFromId(id) {
    if (!id) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function ChatId() {
    const { id, name, avatar } = useLocalSearchParams();
    const router = useRouter();
    const { t, i18n } = useTranslation();

    const MAIN_COLOR = "#b88144";
    const bgColor = getColorFromId(id); // Now bgColor is defined

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: MAIN_COLOR },
                    headerTintColor: 'white',
                    headerTitle: '',
                    headerLeft: () => (
                        <View className="flex-row items-center ml-1 gap-2">
                            <TouchableOpacity onPress={() => router.back()} className="pr-1">
                                <Ionicons name={i18n.language === "en" ? "arrow-back" : "arrow-forward"} size={24} color="white" />
                            </TouchableOpacity>

                            <View className="flex-row items-center gap-3">
                                {avatar ? (
                                    <View style={{ width: 40, height: 40, borderRadius: 20, overflow: 'hidden' }}>
                                        <Image
                                            source={{ uri: avatar }}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode='cover'
                                        />
                                    </View>
                                ) : (
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 20,
                                            backgroundColor: bgColor,
                                            alignItems: "center",
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text className="text-white font-bold text-lg">
                                            {name?.charAt(0)?.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View>
                                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                                        {name}
                                    </Text>
                                    <Text className="text-white/80 text-[10px]">Online</Text>
                                </View>
                            </View>
                        </View>
                    ),
                    headerRight: () => (
                        <View className="flex-row gap-5 mr-4">
                            <TouchableOpacity><Ionicons name="call" size={20} color="white" /></TouchableOpacity>
                            <TouchableOpacity><Ionicons name="videocam" size={22} color="white" /></TouchableOpacity>
                        </View>
                    )
                }}
            />

            <StatusBar backgroundColor={MAIN_COLOR} barStyle="light-content" />

            <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
                <View className="flex-1 items-center justify-center">
                    <Text className="text-gray-400">Chat with {name} started</Text>
                </View>
            </SafeAreaView>
        </>
    );
}