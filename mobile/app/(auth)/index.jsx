import { useEffect } from "react";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store/Store";

export default function Home() {
  const router = useRouter();
  const opacity = useSharedValue(0);
  const { token } = useAuthStore();

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (token) {
        router.replace("(tabs)/chat");
      } else {

        router.replace("/wellcome"); // ✅ correct navigation
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [router, token]);

  return (
    <SafeAreaView className="flex-1 w-full  bg-gray-300/50 justify-center items-center">
      <Animated.Image
        source={require("@/assets/images/icon.png")}
        className="w-[300] h-[300] rounded-full"
      // style={animatedStyle}
      />
    </SafeAreaView>
  );
}

