import React, { createContext, useContext } from "react";
import {
  useGetCurrentUser,
  useLogout,
  getGetCurrentUserQueryKey,
  User,
} from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    data: user,
    isLoading,
    refetch,
  } = useGetCurrentUser({
    query: {
      retry: false,
      queryKey: getGetCurrentUserQueryKey(),
    },
  });

  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    refetch();
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isLoading,
        logout: handleLogout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
