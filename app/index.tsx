import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { useAuth } from "@/providers/AuthProvider";

const Onboarding = () => {
  const router = useRouter();
  const { session } = useAuth();

  const handleStart = () => {
    if (session) {
      router.replace("/(tabs)");
      return;
    }

    router.replace("/login" as never);
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <View className="flex-1 px-6 pb-20 pt-24">
        <View className="flex-row items-center">
          <Image source={icons.logo} className="h-12 w-14" />
          <Text className="ml-5 text-4xl font-bold text-white">Movio</Text>
        </View>

        <View className="mt-auto rounded-3xl border border-dark-100 bg-dark-200/90 p-6">
          <Text className="text-3xl font-bold text-white">Movie App</Text>
          <Text className="mt-3 text-base text-light-200">
            Discover new films, save your favorites, and track what you watched.
          </Text>

          <TouchableOpacity
            className="mt-8 items-center rounded-xl bg-accent py-4"
            onPress={handleStart}
          >
            <Text className="text-base font-semibold text-white">Start</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default Onboarding;
