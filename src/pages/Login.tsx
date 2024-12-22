import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

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
    <div className="min-h-screen bg-gray-50 flex flex-col py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Button
          variant="ghost"
          className="mb-6 text-primary hover:text-primary/90"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#9b87f5',
                    brandAccent: '#7E69AB',
                  },
                },
              },
              className: {
                input: 'custom-input-class',
                label: 'custom-label-class',
              }
            }}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Username or Email Address'
                }
              }
            }}
            theme="light"
            providers={[]}
            view="sign_in"
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;