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
      // First update local state
      setIsLoggedIn(false);
      
      // Then attempt to sign out locally only
      const { error } = await supabase.auth.signOut({ 
        scope: 'local'
      });
      
      // If there's an error but it's just session_not_found, we can ignore it
      if (error && !error.message.includes('session_not_found')) {
        console.error("Logout error:", error);
        toast.error("Error during logout");
        return;
      }

      // Always navigate and show success message
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if there's an error, we want to clear the local state
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return {
    isLoggedIn,
    logout
  };
};