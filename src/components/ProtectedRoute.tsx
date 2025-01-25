// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/AuthProvider"; // Import useAuth

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth(); // Use the authentication context

  if (isLoggedIn === false) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};
