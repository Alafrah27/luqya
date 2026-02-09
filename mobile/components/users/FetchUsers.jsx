
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../store/Store";
import { useSendFriendRequest } from "../../store/transtack/query";
import { useState } from "react";
import { useRouter } from "expo-router";
import { useMemo } from "react";


const colors = [
    "#F87171", // red
    "#60A5FA", // blue
    "#34D399", // green
    "#FBBF24", // yellow
    "#A78BFA", // purple
    "#FB923C", // orange
];

function getColorFromId(id) {

    if (!id || typeof id !== 'string') return colors[0];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}



export default function FetchUsers({ item, online }) {
    const router = useRouter();
    const bgColor = getColorFromId(item._id);
    const { t, i18n } = useTranslation();

    // Mutates
    const { mutate: sendRequest, isPending } = useSendFriendRequest();
    // Assuming you have or will create a useUnfriend hook
    // const { mutate: unfriend, isPending: isUnfriending } = useUnfriend(); 

    const [requestSent, setRequestSent] = useState(false);

    const user = useAuthStore((state) => state?.user);

    // Ensure we are checking the array correctly
    const isFriend = useMemo(() => {
        return user?.friends?.some(friendId =>
            (typeof friendId === 'string' ? friendId : friendId._id) === item._id
        );
    }, [user?.friends, item._id]);

    const handleSendRequest = () => {
        sendRequest(item._id, {
            onSuccess: () => setRequestSent(true),
            onError: (error) => {
                BurntToastifY({
                    title: "Error",
                    message: error?.message,
                    preset: "error",
                    type: "error",
                });
            }
        });
    }

    const handleUnfriend = () => {
        // Call your unfriend API here
        console.log("Unfriending user:", item._id);
    }

    const handleChatIdMessage = () => {
        router.push({
            pathname: "/chat/[id]",
            params: { id: item._id, name: item.FullName, avatar: item.avatar },
        });
    }

    return (
        <View className="flex-row items-center py-5 px-2 bg-white border-b border-gray-100">
            {/* ... Avatar Logic stays the same ... */}
            <View className="relative" style={{ width: 50, height: 50, borderRadius: 25 }}>
                {item?.avatar ? (
                    <Image source={{ uri: item.avatar }} className="w-full h-full rounded-full overflow-hidden" resizeMode='cover' />
                ) : (
                    <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: bgColor, alignItems: "center", justifyContent: "center" }}>
                        <Text className="text-white font-bold text-xl">{item?.FullName?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                )}
                <View className={`h-3 w-3 ${online ? "bg-green-500" : "bg-gray-300"} rounded-full absolute bottom-0 right-0 border-2 border-white`} />
            </View>

            <View className="ml-3 flex-1">
                <Text className="font-bold text-base">{item?.FullName}</Text>

                <View className="flex-row mt-2 items-center gap-2">
                    {/* BUTTON LOGIC START */}
                    {isFriend ? (
                        // IF THEY ARE FRIENDS: Show "Unfriend"
                        <TouchableOpacity
                            className="bg-red-50 border border-red-200 px-4 py-1 rounded-full"
                            activeOpacity={0.7}
                            onPress={handleUnfriend}
                        >
                            <Text className="text-red-600 text-sm font-semibold">
                                {t(i18n.language === "en" ? "Unfriend" : "إلغاء الصداقة")}
                            </Text>
                        </TouchableOpacity>
                    ) : requestSent ? (
                        // IF REQUEST PENDING
                        <View className="bg-gray-100 px-4 py-1 rounded-full border border-gray-200">
                            <Text className="text-gray-500 text-sm font-semibold">
                                {t(i18n.language === "en" ? "Pending" : "معلق")}
                            </Text>
                        </View>
                    ) : (
                        // IF NOT FRIENDS: Show "Add Friend"
                        <TouchableOpacity
                            className="bg-blue-500 px-4 py-1 rounded-full shadow-sm"
                            activeOpacity={0.7}
                            onPress={handleSendRequest}
                            disabled={isPending}
                        >
                            <Text className="text-white text-sm font-semibold">
                                {isPending ? "..." : t(i18n.language === "en" ? "Add Friend" : "إضافة صديق")}
                            </Text>
                        </TouchableOpacity>
                    )}
                    {/* BUTTON LOGIC END */}

                    <TouchableOpacity
                        onPress={handleChatIdMessage}
                        className="bg-gray-100 px-4 py-1 rounded-full border border-gray-200"
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 text-sm font-semibold">
                            {t(i18n.language === "en" ? "Message" : "دردشة")}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}