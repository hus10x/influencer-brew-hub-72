import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  userType: string | null;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  userType: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (sessionError.message.includes('refresh_token_not_found')) {
            await supabase.auth.signOut();
            toast.error("Session expired. Please login again.");
          }
          setIsAuthenticated(false);
          setUserType(null);
          setIsLoading(false);
          return;
        }

        if (session) {
          // Get user type for the current user only
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          if (!profileError && profile) {
            setIsAuthenticated(true);
            setUserType(profile.user_type);
            // Redirect to appropriate dashboard if on index
            if (window.location.pathname === '/') {
              navigate(profile.user_type === 'influencer' ? '/influencer' : '/client');
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error("Error loading user profile");
            setIsAuthenticated(false);
            setUserType(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
        setUserType(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_OUT') {
        setIsLoading(true);
        try {
          // Clear auth state
          setIsAuthenticated(false);
          setUserType(null);
          
          // Only navigate if not already on index
          if (window.location.pathname !== '/') {
            navigate('/');
          }
        } finally {
          setIsLoading(false);
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsLoading(true);
        try {
          if (!session?.user?.id) {
            console.error('No user ID in session');
            return;
          }
          
          setIsAuthenticated(true);
          
          // Get user type for current user only
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();
            
          if (profile) {
            setUserType(profile.user_type);
            // Only navigate if we're not already on the correct dashboard
            const dashboardPath = profile.user_type === 'influencer' ? '/influencer' : '/client';
            if (window.location.pathname !== dashboardPath) {
              navigate(dashboardPath);
            }
          } else if (profileError) {
            console.error('Error fetching profile:', profileError);
            toast.error("Error loading user profile");
          }
        } finally {
          setIsLoading(false);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, userType }}>
      {children}
    </AuthContext.Provider>
  );
};