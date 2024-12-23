import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const LoginForm = () => {
  const navigate = useNavigate();

  return (
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
                email_label: 'Username or Email Address',
                password_label: 'Password',
                button_label: 'Sign In',
                loading_button_label: 'Signing in...',
              }
            }
          }}
          providers={[]}
          view="sign_in"
          redirectTo={window.location.origin}
          onlyThirdPartyProviders={false}
          socialLayout="horizontal"
          showLinks={false}
        />
        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-primary hover:text-primary/90"
            onClick={() => navigate("/signup")}
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </div>
    </div>
  );
};