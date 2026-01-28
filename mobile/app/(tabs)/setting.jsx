import React, { useRef, useCallback, useState } from "react";
import { Alert, RefreshControl, ScrollView, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import UserProfile from "../../components/profile/UserProfile";
import UserAccount from "../../components/profile/userAccount";
import * as ImagePicker from 'expo-image-picker';
import UserNotifications from "../../components/profile/userNotifications";
import AboutUsandService from "../../components/profile/AboutUsandService";
import ShareAndSupport from "../../components/profile/ShareAndSupports";
import CustomBottomSheetModal from "../../components/CustomHookUi/BottomsheetModalCustomHook";
import UpdateUserProfile from "../../components/auth/updateUserProfile";


import AboutUs from "../../components/luqya/AboutUs";
import ContactUs from "../../components/luqya/ContactUs";
import PrivacyPolicyContent from "../../components/luqya/Policy";
import ImagePickerModal from "../../components/CustomHookUi/ImagePickerModal";
import { useAuthStore } from "../../store/Store";
import BurntToastifY from '../../components/CustomHookUi/BurntToatifY';

export default function Setting() {
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [avatar, setAvatar] = useState("");
    const { userAuth, updateUser } = useAuthStore();
    const bottomSheetModalRef = useRef(null);

    const handleImageSelection = async (result) => {
        if (!result.canceled) {
            const asset = result.assets[0];
            const localUri = asset.uri;

            // 1. Set local state for immediate UI update
            setAvatar(localUri);

            // 2. Prepare data for server (Base64 is easiest for JSON APIs)
            const base64Data = `data:image/jpeg;base64,${asset.base64}`;

            // 3. Close picker modal
            setModalVisible(false);

            // 4. Upload
            await SendAvatarToServer(base64Data);
        }
    };

    const handleCamera = async () => {
        try {
            const { granted } = await ImagePicker.requestCameraPermissionsAsync();
            if (!granted) return Alert.alert("Permission Denied");

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true, // Ensure this is true
            });
            await handleImageSelection(result);
        } catch (error) {
            console.log(error);
        }
    };

    const handleGallery = async () => {
        try {
            const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!granted) return Alert.alert("Permission Denied");

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.5,
                base64: true, // Ensure this is true
            });
            await handleImageSelection(result);
        } catch (error) {
            console.log(error);
        }
    };

    const SendAvatarToServer = async (base64Image) => {
        try {
            // Note: Sending large base64 strings might require server-side adjustments
            const result = await updateUser({ avatar: base64Image });
            if (result.success) {
                BurntToastifY({
                    title: "Avatar updated successfully",
                    preset: "done",
                    type: "success"
                });
                await userAuth(); // Refresh user state from server
            } else {
                Alert.alert("Upload Failed", result.message);
            }
        } catch (error) {
            console.error("Upload error:", error);
        }
    };
    const openModal = useCallback((content) => {

        setModalContent(content);
        bottomSheetModalRef.current?.present();
    }, []);
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // 1. Call your function to re-fetch user data
            await userAuth();

            // 2. You could also clear old states here if needed
            console.log("Profile Refreshed");
        } catch (error) {
            console.error(error);
        } finally {
            setRefreshing(false);
        }
    }, [userAuth]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#b88144']}
                        tintColor={'#b88144'}
                    />
                }
            >

                <View style={{ flex: 1, marginTop: 40, marginBottom: 50 }}>





                    <UserProfile
                        avatar={avatar}
                        onPress={(() => setModalVisible(true))} />
                    <ImagePickerModal
                        visible={isModalVisible}
                        onClose={() => setModalVisible(false)}
                        onCamera={handleCamera}
                        onGallery={handleGallery}
                    />
                    {/* TRIGGER BUTTON */}
                    <UserAccount onPress={(() => openModal(<UpdateUserProfile />))} />
                    <UserNotifications
                        onPrivacyPress={() => openModal(<PrivacyPolicyContent />)}
                    />
                    <AboutUsandService
                        onAboutPress={() => openModal(<AboutUs />)}
                        onContactPress={() => openModal(<ContactUs />)}
                    />
                    <ShareAndSupport />
                </View>
            </ScrollView>

            {/* MODAL COMPONENT */}
            <CustomBottomSheetModal
                ref={bottomSheetModalRef}

            >
                {modalContent}
            </CustomBottomSheetModal>
        </SafeAreaView>
    );
}