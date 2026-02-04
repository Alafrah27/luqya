import { Stack } from "expo-router";

export default function AuthLayout() {
    return (


      


            <Stack screenOptions={{

            }}>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="wellcome" options={{ headerShown: false }} />
                <Stack.Screen name="register" options={{
                    animation: 'fade',
                    headerShown: false,

                }} />
                <Stack.Screen name="login" options={{
                    animation: 'fade',
                    headerShown: false,

                }} />
            </Stack>
      


    );
}
