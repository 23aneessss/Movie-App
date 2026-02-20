import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants/images";
import { fetchCurrentUser } from "@/services/api";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

const Profile = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [user, setUser] = useState<SessionUserDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          setLoading(true);
          setError(null);
          const payload = await fetchCurrentUser();
          setUser(payload);
        } catch (unknownError) {
          setError(
            unknownError instanceof Error ? unknownError.message : "Unable to load profile"
          );
        } finally {
          setLoading(false);
        }
      };

      loadUser();
    }, [])
  );

  const handleLogout = async () => {
    await signOut();
    router.replace("/login" as never);
  };

  return (
   <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1 px-5">
        <Text className="mt-4 text-2xl font-bold text-white">Profile</Text>

        {loading ? (
          <ActivityIndicator className="mt-8" size="large" color="#AB8BFF" />
        ) : error ? (
          <Text className="mt-8 text-red-400">{error}</Text>
        ) : (
          <View className="mt-6 rounded-2xl border border-dark-100 bg-dark-200 p-5">
            <Text className="text-sm text-light-200">Name</Text>
            <Text className="mt-1 text-lg font-semibold text-white">{user?.name ?? "N/A"}</Text>

            <Text className="mt-4 text-sm text-light-200">Email</Text>
            <Text className="mt-1 text-lg font-semibold text-white">{user?.email ?? "N/A"}</Text>

            <Text className="mt-4 text-sm text-light-200">Member since</Text>
            <Text className="mt-1 text-lg font-semibold text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
            </Text>

            <TouchableOpacity
              className="mt-8 items-center rounded-xl bg-accent py-4"
              onPress={handleLogout}
            >
              <Text className="text-base font-semibold text-white">Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default Profile;
