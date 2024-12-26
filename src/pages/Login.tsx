import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { LoginForm } from "@/components/auth/LoginForm";

const Login = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching profile:', error);
            toast.error("Error fetching profile");
            return;
          }

          if (!profile) {
            console.error('Profile not found');
            toast.error("Profile not found");
            return;
          }

          // Immediate redirect based on user type
          const dashboardRoute = profile.user_type === 'influencer' ? '/influencer' : '/client';
          navigate(dashboardRoute, { replace: true });
        } catch (error) {
          console.error('Error during login:', error);
          toast.error("Error during login");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <AuthLayout>
      <AuthHeader title="Sign in to your account" />
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;