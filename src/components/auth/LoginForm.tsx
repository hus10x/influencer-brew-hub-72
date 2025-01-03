import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export const LoginForm = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const appearance = {
    theme: ThemeSupa,
    variables: {
      default: {
        colors: {
          brand: 'hsl(var(--primary))',
          brandAccent: 'hsl(var(--primary))',
          inputBackground: 'hsl(var(--background))',
          inputText: 'hsl(var(--foreground))',
          inputPlaceholder: 'hsl(var(--muted-foreground))',
          messageText: 'hsl(var(--foreground))',
          anchorTextColor: 'hsl(var(--primary))',
          dividerBackground: 'hsl(var(--border))',
        },
      },
      dark: {
        colors: {
          inputBackground: 'hsl(222 47% 6%)', // Using card background color for dark mode
          inputBorder: 'hsl(217.2 32.6% 12%)',
          inputText: 'hsl(var(--foreground))',
          inputPlaceholder: 'hsl(var(--muted-foreground))',
        },
      },
    },
    className: {
      container: 'w-full',
      button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      input: 'bg-background border-input dark:bg-card',
      label: 'text-foreground',
    },
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-card text-card-foreground py-8 px-6 shadow-md rounded-lg sm:px-10 border">
        <Auth
          supabaseClient={supabase}
          appearance={appearance}
          theme={theme === 'dark' ? 'dark' : 'light'}
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