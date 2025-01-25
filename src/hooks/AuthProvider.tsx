import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type AuthContextType = {
  isLoggedIn: boolean | null;
  userType: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: null,
  userType: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check local storage for cached session
        const cachedSession = localStorage.getItem("supabase_session");
        if (cachedSession) {
          const { session, userType } = JSON.parse(cachedSession);
          setIsLoggedIn(true);
          setUserType(userType);
          return;
        }

        // Fetch session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          if (error.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
          }
          setIsLoggedIn(false);
          return;
        }
        
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setIsLoggedIn(true);
            setUserType(profile.user_type);
            // Cache the session and user type
            localStorage.setItem("supabase_session", JSON.stringify({ session, userType: profile.user_type }));
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsLoggedIn(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserType(null);
        localStorage.removeItem("supabase_session"); // Clear cached session
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setIsLoggedIn(true);
            setUserType(profile.user_type);
            // Cache the session and user type
            localStorage.setItem("supabase_session", JSON.stringify({ session, userType: profile.user_type }));
          }
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, userType }}>
      {children}
    </AuthContext.Provider>
  );
};
