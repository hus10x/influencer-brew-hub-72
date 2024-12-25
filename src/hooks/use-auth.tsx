import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      // First try to get the current session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If no session exists, just clean up the local state
        setIsLoggedIn(false);
        navigate("/");
        toast.success("Logged out successfully");
        return;
      }

      // If we have a session, attempt to sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        // If it's a session_not_found error, we can treat it as a successful logout
        if (error.message.includes('session_not_found')) {
          setIsLoggedIn(false);
          navigate("/");
          toast.success("Logged out successfully");
          return;
        }
        // For other errors, show an error message
        toast.error("Error during logout");
        return;
      }

      // If logout was successful
      setIsLoggedIn(false);
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, we want to clean up the local state
      setIsLoggedIn(false);
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return {
    isLoggedIn,
    logout
  };
};