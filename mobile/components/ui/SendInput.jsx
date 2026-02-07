import { View, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Microphone from './microphone';

export default function SendInput() {
    const { t, i18n } = useTranslation();
    return (

        <View className=' px-2 '>
            <View className='flex-row items-center  '>
                <View className=' w-[84%] flex-row bg-white rounded-full px-2 py-1 '>

                    <TouchableOpacity className='bg-[#b88144] justify-center items-center  p-2 rounded-full'>
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>
                    <TextInput
                        placeholder={t(i18n.language === "en" ? "Type a message..." : "اكتب رسالة...")}
                        placeholderTextColor="black"
                        className="flex-1  p-2 bg-transparent outline-none text-black font-semibold"
                        multiline


                        style={{ maxHeight: 100, textAlign: i18n.language === "en" ? "left" : "right" }}
                    />
                </View>
                <TouchableOpacity className=' justify-center items-center  p-3 rounded-full'>
                    {/* <Ionicons
                        style={{
                            // Flip the icon horizontally (180 degrees) if language is Arabic
                            transform: [{ scaleX: i18n.language === 'ar' ? -1 : 1 }],

                        }}
                        name="send" size={24} color="#b88144" /> */}
                    <Microphone />
                </TouchableOpacity>
            </View>
        </View>

    )
}