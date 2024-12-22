import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please login to access this page");
          navigate("/login");
          return;
        }

        // Get user profile to check role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;

        if (!profile) {
          toast.error("Profile not found");
          navigate("/");
          return;
        }

        // Check if user has permission to access the route
        const isInfluencerRoute = location.pathname === '/influencer';
        const isClientRoute = location.pathname === '/client';

        if (isInfluencerRoute && profile.user_type !== 'influencer') {
          toast.error("Access denied. Influencer access only.");
          navigate("/");
          return;
        }

        if (isClientRoute && profile.user_type !== 'business') {
          toast.error("Access denied. Business access only.");
          navigate("/");
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        toast.error("An error occurred while checking permissions");
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};