import { useAuth } from "@/lib/auth";
import { Redirect, useLocation } from "wouter";
import { ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }

  if (requireSuperAdmin && !user.isSuperAdmin) {
    return <Redirect to="/dashboard" />;
  }

  if (!requireSuperAdmin && user.isSuperAdmin) {
    return <Redirect to="/superadmin" />;
  }

  return <>{children}</>;
}