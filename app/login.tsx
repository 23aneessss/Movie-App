import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/providers/AuthProvider";

const Login = () => {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        setError(result.error.message ?? "Login failed");
        return;
      }

      await refresh();
      router.replace("/(tabs)");
    } catch (unknownError) {
      setError(unknownError instanceof Error ? unknownError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "movieapp://",
      });

      if (result.error) {
        setError(result.error.message ?? "Google login failed");
      }
    } catch (unknownError) {
      setError(
        unknownError instanceof Error ? unknownError.message : "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="absolute w-full z-0"
        resizeMode="cover"
      />

      <SafeAreaView className="flex-1 px-6">
        <View className="mt-16">
          <Image source={icons.logo} className="h-12 w-14" />
          <Text className="mt-8 text-3xl font-bold text-white">Welcome back</Text>
          <Text className="mt-2 text-light-200">Login to continue</Text>
        </View>

        <View className="mt-10 gap-4">
        <TextInput
          className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-4 text-white"
          placeholder="Email"
          placeholderTextColor="#A8B5DB"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          className="rounded-xl border border-dark-100 bg-dark-200 px-4 py-4 text-white"
          placeholder="Password"
          placeholderTextColor="#A8B5DB"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text className="text-red-400">{error}</Text> : null}

        <TouchableOpacity
          className="items-center rounded-xl bg-accent py-4"
          disabled={loading}
          onPress={handleEmailLogin}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-base font-semibold text-white">Login</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="items-center rounded-xl border border-accent py-4"
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text className="text-base font-semibold text-accent">Continue with Google</Text>
        </TouchableOpacity>
      </View>

        <View className="mt-auto flex-row justify-center pb-8">
          <Text className="text-light-200">No account yet? </Text>
          <Link href={"/signup" as never} className="font-semibold text-accent">
            Sign up
          </Link>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default Login;
