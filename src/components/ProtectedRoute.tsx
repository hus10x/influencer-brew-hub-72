import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthProvider";
import { SkeletonLoader } from "@/components/SkeletonLoader"; // Import the skeleton loader

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userType } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Show skeleton loader while checking auth
  if (isLoggedIn === null) {
    return <SkeletonLoader />;
  }

  // Check if user is trying to access the wrong dashboard
  useEffect(() => {
    if (isLoggedIn && userType) {
      const path = location.pathname;
      if (path.includes('/client') && userType !== 'business') {
        navigate('/influencer');
        toast.error("Access denied. Redirecting to influencer dashboard.");
      } else if (path.includes('/influencer') && userType !== 'influencer') {
        navigate('/client');
        toast.error("Access denied. Redirecting to client dashboard.");
      }
    }
  }, [isLoggedIn, userType, location, navigate]);

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
