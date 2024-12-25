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
      setIsLoggedIn(false);
      
      const { error } = await supabase.auth.signOut();
      
      if (error && !error.message.includes('session_not_found')) {
        console.error("Logout error:", error);
        toast.error("Error during logout");
        return;
      }

      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      navigate("/");
      toast.success("Logged out successfully");
    }
  };

  return {
    isLoggedIn,
    logout
  };
};