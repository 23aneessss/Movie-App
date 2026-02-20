import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

import { authClient } from "@/lib/auth-client";

interface AuthContextValue {
  session: ReturnType<typeof authClient.useSession>["data"];
  isLoading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const sessionState = authClient.useSession();

  const refresh = useCallback(async () => {
    await sessionState.refetch();
  }, [sessionState]);

  const signOut = useCallback(async () => {
    await authClient.signOut();
    await sessionState.refetch();
  }, [sessionState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session: sessionState.data,
      isLoading: sessionState.isPending,
      refresh,
      signOut,
    }),
    [refresh, sessionState.data, sessionState.isPending, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
