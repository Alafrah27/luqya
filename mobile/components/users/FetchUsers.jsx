
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";

const colors = [
    "#F87171", // red
    "#60A5FA", // blue
    "#34D399", // green
    "#FBBF24", // yellow
    "#A78BFA", // purple
    "#FB923C", // orange
];

function getColorFromId(id) {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

export default function FetchUsers({ item }) {
    const bgColor = getColorFromId(item._id);
    const { t, i18n } = useTranslation()

    return (
        <View className="flex-row items-center p-5 bg-white border-b border-gray-100">
            {item?.avatar ? (
                <View className="relative"
                    style={{ width: 50, height: 50, borderRadius: 25 }}
                >

                    <Image
                        source={{ uri: item.avatar }}
                        className="w-full h-full rounded-full  overflow-hidden"
                        resizeMode='cover'
                    />
                    <Text className="h-3 w-3 bg-green-500 rounded-full absolute bottom-0 right-0"></Text>
                </View>
            ) : (
                
                <View
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: 25,
                        backgroundColor: bgColor,
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                    }}
                >
                    <Text className="text-white font-bold text-xl">
                        {item?.FullName?.charAt(0)?.toUpperCase()}
                    </Text>
                    <Text className="h-3 w-3 bg-green-500 rounded-full absolute bottom-0 right-0"></Text>
                </View>
            )}

            <View className="ml-3 flex-1 ">
                <Text className="font-bold text-base">{item?.FullName}</Text>

                <View className="flex-row mt-2 space-x-2 gap-2   ">
                    <TouchableOpacity
                        className="bg-blue-500 px-4 py-1 rounded-full"
                        activeOpacity={0.7}
                    >
                        <Text className="text-white text-sm font-semibold">{t(i18n.language === "en" ? "add friend" : "إضافة صديق")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-200 px-4 py-1 rounded-full"
                        activeOpacity={0.7}
                    >
                        <Text className="text-gray-700 text-sm font-semibold"> {t(i18n.language === "en" ? "message" : " دردشة")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
