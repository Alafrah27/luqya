import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,

    Keyboard,
    TouchableWithoutFeedback,
    FlatList,
} from "react-native";
import React from "react";
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import SendInput from "../../components/ui/SendInput";
import { RenderItem } from "../../components/ui/messages";
import { chatMessages } from "../../components/data";

/* Avatar color helper */
const avatarColors = [
    "#F87171",
    "#60A5FA",
    "#34D399",
    "#FBBF24",
    "#A78BFA",
    "#FB923C",
];


function getColorFromId(id) {
    if (!id) return avatarColors[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return avatarColors[Math.abs(hash) % avatarColors.length];
}

const useGradualAnimation = () => {
    const height = useSharedValue(0);

    useKeyboardHandler(
        {
            onMove: event => {
                'worklet';
                height.value = Math.max(event.height, 0);
            },
        },
        []
    );
    return { height };
};

export default function ChatId() {
    const { id, name, avatar } = useLocalSearchParams();
    const router = useRouter();
    const { i18n } = useTranslation();

    const MAIN_COLOR = "#b88144";
    const bgColor = getColorFromId(id);

    const { height } = useGradualAnimation();

    const fakeView = useAnimatedStyle(() => {
        return {
            height: Math.abs(height.value),
        };
    }, []);


    return (
        <>

            <Stack.Screen
                options={{
                    headerShown: true,
                    headerStyle: { backgroundColor: MAIN_COLOR },
                    headerTintColor: "white",
                    headerTitle: "",
                    headerLeft: () => (
                        <View className="flex-row items-center ml-1 gap-2">
                            <TouchableOpacity onPress={() => router.back()}>
                                <Ionicons
                                    name={i18n.language === "en" ? "arrow-back" : "arrow-forward"}
                                    size={24}
                                    color="white"
                                />
                            </TouchableOpacity>

                            <View className="flex-row items-center gap-3">
                                {avatar ? (
                                    <Image
                                        source={{ uri: avatar }}
                                        style={{ width: 40, height: 40, borderRadius: 20 }}
                                    />
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
                                        <Text className="text-white font-bold">
                                            {name?.charAt(0)?.toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                                <View>
                                    <Text className="text-white font-bold">{name}</Text>
                                    <Text className="text-white/80 text-[10px]">Online</Text>
                                </View>
                            </View>
                        </View>
                    ),
                }}
            />

            <StatusBar backgroundColor={MAIN_COLOR} barStyle="light-content" />


            {/* ❗ TouchableWithoutFeedback ONLY wraps message area */}
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                {/* Messages */}
                <View className="flex-1 ">

                    <FlatList
                        data={chatMessages}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => <RenderItem item={item} />}
                        inverted // Starts messages from the bottom (standard for chat)
                        contentContainerStyle={{ paddingVertical: 10 }}
                        showsVerticalScrollIndicator={false}
                        keyboardDismissMode="on-drag" // Best for UX
                        keyboardShouldPersistTaps="handled"
                    />

                </View>

            </TouchableWithoutFeedback>
            {/* ✅ Input OUTSIDE TouchableWithoutFeedback */}


            <SendInput chatId={id} />
            <Animated.View style={fakeView} />


        </>

    );
}
