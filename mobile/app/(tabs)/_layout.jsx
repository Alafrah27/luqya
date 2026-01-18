import { Tabs } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";
export default function TabsLayout() {
    const { t } = useTranslation();
    return (
        <>

            <Tabs screenOptions={{

                tabBarActiveTintColor: '#b88144',
                tabBarInactiveTintColor: '#888888',
                tabBarStyle: {
                    backgroundColor: '#f0f0f0',
                    borderTopWidth: 0,
                    elevation: 5,
                    paddingBottom: 8,
                    height: 70,
                },
                tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' }
            }} >
                <Tabs.Screen name="chat" options={{

                    title: t('tab_chat'),
                    tabBarIcon: ({ color, size }) => (
                        // You can use any icon library you prefer
                        <Ionicons name="chatbubbles" size={size} color={color} />
                    ),

                    headerStyle: {
                        backgroundColor: '#b88144',
                        borderBottomWidth: 0,
                        elevation: 5,
                        paddingBottom: 8,

                    },
                    headerTitleStyle: {
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 20,

                    },



                }} />
                <Tabs.Screen name="contact" options={{

                    title: t('tab_contacts'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#b88144',
                        borderBottomWidth: 0,
                        elevation: 5,

                    },
                    headerTitleStyle: {
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 20,

                    },
                }} />
                <Tabs.Screen name="notification" options={{

                    title: t('tab_notifications'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#b88144',
                        borderBottomWidth: 0,
                        elevation: 5,

                        justifyContent: 'center',
                    },
                    headerTitleStyle: {
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 20,

                    },
                }} />
                <Tabs.Screen name="setting" options={{
                    title: t('tab_settings'),
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="settings" size={size} color={color} />
                    ),
                    headerStyle: {
                        backgroundColor: '#b88144',
                        borderBottomWidth: 0,
                        elevation: 5,


                    },
                    headerTitleStyle: {
                        color: 'black',
                        fontWeight: 'bold',
                        fontSize: 20,

                    },
                }} />
            </Tabs>

        </>
    );
}