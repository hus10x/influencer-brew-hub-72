import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, isAuthenticated, userType } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-pulse text-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is trying to access the wrong dashboard
  const path = location.pathname;
  if (path.includes('/client') && userType !== 'business') {
    return <Navigate to="/influencer" replace />;
  }
  if (path.includes('/influencer') && userType !== 'influencer') {
    return <Navigate to="/client" replace />;
  }

  return <>{children}</>;
};