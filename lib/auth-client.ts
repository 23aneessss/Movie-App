import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

const baseURL = process.env.EXPO_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "movieapp",
      storagePrefix: "movie-app",
      storage: {
        getItem: (key) => SecureStore.getItem(key),
        setItem: (key, value) => SecureStore.setItem(key, value),
      },
    }),
  ],
});
