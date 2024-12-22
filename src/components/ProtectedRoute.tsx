import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          toast.error('Error fetching user profile');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!profile) {
          // If no profile exists, create one
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([
              {
                id: session.user.id,
                email: session.user.email,
                user_type: 'business' // Default to business if no profile exists
              }
            ]);

          if (insertError) {
            console.error('Error creating profile:', insertError);
            toast.error('Error creating user profile');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          setUserType('business');
        } else {
          setUserType(profile.user_type);
        }

        setIsAuthenticated(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication error');
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect business users trying to access influencer dashboard and vice versa
  if (userType === 'business' && window.location.pathname === '/influencer') {
    return <Navigate to="/client" replace />;
  }
  
  if (userType === 'influencer' && window.location.pathname === '/client') {
    return <Navigate to="/influencer" replace />;
  }

  return <>{children}</>;
};