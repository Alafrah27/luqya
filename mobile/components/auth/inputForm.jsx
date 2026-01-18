import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard
} from 'react-native';
import React, { useState, useRef, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import BottomSheet from '@gorhom/bottom-sheet';
import { CountryPicker } from 'react-native-country-codes-picker';

export default function InputForm() {
    const { t } = useTranslation();

    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);

    const [visible, setVisible] = useState(false);
    const [country, setCountry] = useState({
        cca2: 'SA',
        callingCode: '966',
        name: 'Saudi Arabia',
        flag: '🇸🇦',
    });

    const openSheet = () => {
        setVisible(true);
        bottomSheetRef.current?.snapToIndex(1);
    };

    const closeSheet = () => {
        setVisible(false);
        bottomSheetRef.current?.close();
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View className="flex-1 w-full px-2">
                <View className="flex-row items-center justify-between gap-4">

                    {/* Country */}
                    <View>
                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                            {t('phone_country')}
                        </Text>

                        <TouchableOpacity
                            onPress={openSheet}
                            className="flex-row items-center justify-between gap-6 border border-gray-300 rounded-full px-4 py-3"
                        >
                            <Text className="text-base text-gray-600">
                                {country.flag} +{country.callingCode}
                            </Text>
                            <Ionicons name="chevron-down" size={24} color="black" />
                        </TouchableOpacity>
                    </View>

                    {/* Phone number */}
                    <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-700 mb-2">
                            {t('phone_number')}
                        </Text>

                        <TextInput
                            className="flex-1 border border-gray-300 rounded-full px-5 py-3 text-base text-gray-700"
                            placeholder={t('phone_placeholder')}
                            placeholderTextColor="#9CA3AF"
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>

                {/* Bottom Sheet */}
                <BottomSheet
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    enablePanDownToClose
                    onClose={closeSheet}
                >
                    <CountryPicker
                        show={visible}
                        pickerButtonOnPress={(item) => {
                            setCountry({
                                cca2: item.code,
                                callingCode: item.dial_code.replace('+', ''),
                                name: item.name.en,
                                flag: item.flag,
                            });
                            closeSheet();
                        }}
                    />
                </BottomSheet>
            </View>
        </TouchableWithoutFeedback>
    );
}
