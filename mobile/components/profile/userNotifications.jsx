import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons'


import { useTranslation } from 'react-i18next';
export default function UserNotifications({ onPrivacyPress }) {
    const { t } = useTranslation();
    return (
        <View className="w-[95%] mx-auto mt-7 mb-2 ">
            <Text className="text-[12px] font-bold text-slate-500 capitalize leading-tight mb-2">{t("user_notifiation_policy")}</Text>
            <View className=" items-center  px-4 gap-10 bg-white p-4 rounded-2xl relative ">
                <TouchableOpacity
                    onPress={onPrivacyPress}
                    className="flex-row items-center justify-between w-full " >
                    <View className="flex-row items-center gap-2">
                        <MaterialIcons name="privacy-tip" size={20} color="#b88144" />
                        <Text className="text-[13px] font-semibold text-black capitalize leading-tight">{t("user_privacy_policy")}</Text>
                    </View>
                    <Entypo name="chevron-small-left" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity className="flex-row items-center justify-between w-full" >
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="notifications" size={19} color="#b88144" />
                        <Text className="text-[13px] font-semibold text-black capitalize leading-tight">{t("user_notification")}</Text>
                    </View>
                  <Entypo name="chevron-small-left" size={24} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    )
}