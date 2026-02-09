import { View, TouchableOpacity, TextInput, Text } from 'react-native'
import React, { useRef, useState, useMemo, useCallback } from 'react' // Added useMemo, useCallback
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import Microphone from './microphone';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import AttachmentItem from './AttachmentItem';
import { SocketIoStore } from '../../store/socketioStore';
import { useSendMessage } from '../../store/transtack/query';

export default function SendInput({ chatId }) {
    const [inputActive, setInputActive] = useState(false);
    const [text, setText] = useState(""); // Track text to toggle Send/Mic
    const bottomSheetModalRef = useRef(null);
    const { t, i18n } = useTranslation();
    const { sendMessage: socketSendMessage } = SocketIoStore();
    const { mutate: sendApiMessage } = useSendMessage();

    // 1. Fixed Snap Points
    const snapPoints = useMemo(() => ['35%'], []);

    // 2. Logic to toggle between Microphone and Send button


    const openModal = useCallback(() => {
        bottomSheetModalRef.current?.present();
    }, []);

    const handleSendMessage = () => {
        if (!text.trim()) return;

        // Option 1: Send via API (Reliable, returns Promise)
        sendApiMessage(
            { chatId, text, fileUrl: null, fileType: "none" },
            {
                onSuccess: () => {
                    console.log("Message sent via API");
                },
                onError: (err) => {
                    console.error("API Send Error:", err);
                    // Fallback or error handling
                }
            }
        );

        // Option 2: Send via Socket (Fire & Forget, already implemented)
        // socketSendMessage({
        //     chatId: chatId,
        //     text: text,
        //     fileUrl: null,
        //     fileType: "none"
        // });
        setText("");
        setInputActive(false)
    };

    return (
        // Changed flex-1 to a standard padding container so it stays at the bottom
        <View className='px-2 w-full bg- mb-1'>
            <View className='flex-row items-center mb-3'>

                {/* Input Container */}
                <View className='w-[84%] flex-row bg-white rounded-full px-2 py-1 items-center'>
                    <TouchableOpacity
                        onPress={openModal} // You can use this for attachments
                        className='bg-[#b88144] justify-center items-center p-2 rounded-full'
                    >
                        <Ionicons name="add" size={24} color="white" />
                    </TouchableOpacity>

                    <TextInput
                        placeholder={t(i18n.language === "en" ? "Type a message..." : "اكتب رسالة...")}
                        className="flex-1 p-2 bg-transparent text-slate-500 text-sm"
                        multiline
                        value={text}
                        onChangeText={(val) => {
                            setText(val);
                            setInputActive(val.trim().length > 0);
                        }} // Updates the button state
                        style={{
                            maxHeight: 100,
                            textAlign: i18n.language === "en" ? "left" : "right"
                        }}
                    />
                </View>

                {/* Send or Microphone Button */}
                <View className="flex-1 items-center justify-center">
                    {inputActive ? (
                        <TouchableOpacity
                            onPress={handleSendMessage}
                            className='p-2 rounded-full'
                        >
                            <Ionicons
                                style={{ transform: [{ scaleX: i18n.language === 'ar' ? -1 : 1 }] }}
                                name="send"
                                size={28}
                                color="#b88144"
                            />
                        </TouchableOpacity>
                    ) : (
                        <Microphone />
                    )}
                </View>
            </View>

            {/* Bottom Sheet Modal */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                enablePanDownToClose={true}
            // backgroundStyle={{ backgroundColor: '#fff' }} // Optional styling
            >
                <BottomSheetView style={{ padding: 20, paddingBottom: 40 }}>
                    <Text className="text-center text-lg font-bold mb-6 text-gray-800">
                        {t(i18n.language === "en" ? "Share" : "مشاركة")}
                    </Text>

                    {/* Grid Container */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 20 }}>

                        {/* Document (PDF) */}
                        <AttachmentItem
                            icon="document"
                            color="#7F66FF"
                            label={t(i18n.language === "en" ? "Document" : "مستند")}
                            onPress={() => console.log("PDF Picker")}
                        />

                        {/* Camera */}
                        <AttachmentItem
                            icon="camera"
                            color="#FF4C7B"
                            label={t(i18n.language === "en" ? "Camera" : "كاميرا")}
                            onPress={() => console.log("Camera Picker")}
                        />

                        {/* Gallery (Images/Video) */}
                        <AttachmentItem
                            icon="images"
                            color="#C071FF"
                            label={t(i18n.language === "en" ? "Gallery" : "المعرض")}
                            onPress={() => console.log("Gallery Picker")}
                        />




                        {/* Location */}
                        {/* <AttachmentItem
                            icon="location"
                            color="#20C971"
                            label={t(i18n.language === "en" ? "Location" : "الموقع")}
                            onPress={() => console.log("Location Picker")}
                        /> */}

                        {/* Contact */}
                        <AttachmentItem
                            icon="person"
                            color="#00A5F4"
                            label={t(i18n.language === "en" ? "Contact" : "جهة اتصال")}
                            onPress={() => console.log("Contact Picker")}
                        />
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    )
}