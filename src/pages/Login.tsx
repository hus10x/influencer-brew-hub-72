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
          // Get user profile to check user type
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            toast.error("Error fetching profile");
            return;
          }

          if (!profile) {
            toast.error("Profile not found");
            return;
          }

          // Redirect based on user type
          navigate(profile.user_type === 'influencer' ? '/influencer' : '/client');
        } catch (error) {
          console.error('Error checking profile:', error);
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