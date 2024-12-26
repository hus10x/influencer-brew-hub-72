import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  if (userType === 'business' && window.location.pathname === '/influencer') {
    console.log('Redirecting business user from influencer to client dashboard');
    return <Navigate to="/client" replace />;
  }
  
  if (userType === 'influencer' && window.location.pathname === '/client') {
    console.log('Redirecting influencer from client to influencer dashboard');
    return <Navigate to="/influencer" replace />;
  }

  return <>{children}</>;
};