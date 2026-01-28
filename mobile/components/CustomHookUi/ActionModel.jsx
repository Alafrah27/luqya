import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';

export default function ActionModal({
    visible,
    onClose,
    title,
    cancelLabel,
    description, // Added description for clarity
    onHandleFn,
    actionLabel,  // e.g., "Logout", "Delete", "Confirm"
    isDangerous = false // Changes button color to red if true
}) {
    

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            {/* Backdrop */}
            <Pressable
                className="flex-1 bg-black/60 justify-center items-center px-6"
                onPress={onClose}
            >
                {/* Modal Card - Stop Propagation prevents closing when clicking the card itself */}
                <Pressable className="w-full bg-white rounded-[30px] p-6 shadow-xl overflow-hidden">

                    <View className="items-center mb-6">
                        <Text className="text-xl font-bold text-slate-900 text-center mb-2">
                            {title}
                        </Text>
                        {description && (
                            <Text className="text-slate-500 text-center text-[14px]">
                                {description}
                            </Text>
                        )}
                    </View>

                    <View className="flex-row gap-3">
                        {/* Cancel Button */}
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 py-4 rounded-2xl bg-slate-100 items-center"
                        >
                            <Text className="text-slate-600 font-bold text-base">
                                {cancelLabel}
                            </Text>
                        </TouchableOpacity>

                        {/* Action Button */}
                        <TouchableOpacity
                            onPress={() => {
                                onHandleFn();
                                onClose();
                            }}
                            className={`flex-1 py-4 rounded-2xl items-center ${isDangerous ? 'bg-red-500' : 'bg-[#b88144]'
                                }`}
                        >
                            <Text className="text-white font-bold text-base">
                                {actionLabel}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}