import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import SettingLanguages from '../components/profile/SettingLanguages'
import DeleteAccount from '../components/profile/deleteAccount'
import LogoutPage from '../components/profile/Logout'
import CustomBottomSheetModal from '../components/CustomHookUi/BottomsheetModalCustomHook'
import Langauges from '../components/profile/Langauges'

export default function Accountsetting() {
  const [modalContent, setModalContent] = useState(null);
  const bottomSheetModalRef = useRef(null);
  const router = useRouter()
  const { t } = useTranslation()
  const openModal = useCallback((content) => {
    // The modal needs a tiny bit of time to mount if it's dynamic, 
    // but usually, present() works immediately.
    setModalContent(content);
    bottomSheetModalRef.current?.present();
  }, []);

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="flex-1 px-5 py-2 mt-3"
        showsVerticalScrollIndicator={false}
        style={{ flexGrow: 1 }}
      >
        <View className="flex-row items-center space-x-2 pb-4 gap-8 mb-8">

          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-white w-10 h-10 items-center justify-center rounded-full">

            <Ionicons name={t("icon")} size={24} color="black" />
          </TouchableOpacity>

          <Text className="text-[16px] font-bold text-black capitalize text-center">{t("setting_account")}</Text>
        </View>
        <View className="w-full gap-3 ">
          <SettingLanguages onLangauageOpen={() => openModal(<Langauges />)} />
          <DeleteAccount />
          <LogoutPage />
        </View>
        <CustomBottomSheetModal
          ref={bottomSheetModalRef}
        >
          {modalContent}
        </CustomBottomSheetModal>
      </ScrollView>
    </SafeAreaView>
  )
}