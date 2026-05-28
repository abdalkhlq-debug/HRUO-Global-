import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useLogin, useLogout, useGetMe, getGetMeQueryKey, type UserProfile, type LoginInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  login: (data: LoginInput) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("hruo_token"));
  const [, setLocation] = useLocation();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: getGetMeQueryKey(),
    }
  });

  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  useEffect(() => {
    if (token) {
      localStorage.setItem("hruo_token", token);
    } else {
      localStorage.removeItem("hruo_token");
    }
  }, [token]);

  const login = async (data: LoginInput) => {
    const response = await loginMutation.mutateAsync({ data });
    setToken(response.token);
    await refetch();
    if (response.user.isSuperAdmin) {
      setLocation("/superadmin");
    } else {
      setLocation("/dashboard");
    }
  };

  const logout = () => {
    setToken(null);
    logoutMutation.mutate(undefined);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user: user || null, token, login, logout, isLoading: isUserLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
