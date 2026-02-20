import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "react-native";

import { useAuth, AuthProvider } from "@/providers/AuthProvider";

import "./global.css";

const AuthGate = () => {
  const segments = useSegments();
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const currentSegment = segments[0] as string | undefined;
    const onProtectedRoute =
      currentSegment === "(tabs)" || currentSegment === "movies";
    const onAuthRoute = currentSegment === "login" || currentSegment === "signup";

    if (!session && onProtectedRoute) {
      router.replace("/login" as never);
      return;
    }

    if (session && onAuthRoute) {
      router.replace("/(tabs)" as never);
    }
  }, [isLoading, router, segments, session]);

  return null;
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <>
        <StatusBar hidden />
        <AuthGate />
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="signup" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="movies/[id]" options={{ headerShown: false }} />
        </Stack>
      </>
    </AuthProvider>
  );
}
