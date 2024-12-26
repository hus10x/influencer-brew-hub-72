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

        // Special case for specific email
        if (session.user.email === 'husainalhamadd@gmail.com') {
          setUserType('influencer');
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // First try to get the existing profile
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching profile:', fetchError);
          toast.error('Error fetching user profile');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // If profile exists, use its user_type
        if (profile) {
          console.log('Found profile with user_type:', profile.user_type);
          setUserType(profile.user_type);
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }

        // If no profile exists, create one with the user_type from URL
        const desiredUserType = window.location.pathname.includes('influencer') ? 'influencer' : 'business';
        
        const { error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            user_type: desiredUserType
          }, {
            onConflict: 'id'
          });

        if (upsertError) {
          console.error('Error upserting profile:', upsertError);
          toast.error('Error creating user profile');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        setUserType(desiredUserType);
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