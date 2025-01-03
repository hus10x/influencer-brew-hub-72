import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/hooks/use-theme";

interface SignUpFormProps {
  userType: 'influencer' | 'business';
  setUserType: (type: 'influencer' | 'business') => void;
}

export const SignUpForm = ({ userType, setUserType }: SignUpFormProps) => {
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
          inputBackground: 'hsl(222 47% 6%)',
          inputBorder: 'hsl(217.2 32.6% 12%)',
          inputText: 'hsl(var(--foreground))',
          inputPlaceholder: 'hsl(var(--muted-foreground))',
          messageText: 'hsl(var(--foreground))',
          anchorTextColor: 'hsl(var(--primary))',
          dividerBackground: 'hsl(var(--border))',
        },
      },
    },
    className: {
      container: 'w-full',
      button: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      input: 'bg-background border-input dark:bg-card dark:border-input',
      label: 'text-foreground',
      anchor: 'text-primary hover:text-primary/90',
    },
  };

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-card text-card-foreground py-8 px-6 shadow-md rounded-lg sm:px-10 border">
        <div className="mb-6">
          <RadioGroup
            defaultValue={userType}
            onValueChange={(value) => setUserType(value as 'influencer' | 'business')}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="influencer" id="influencer" />
              <Label htmlFor="influencer">Influencer</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="business" id="business" />
              <Label htmlFor="business">Business</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mb-4 p-4 bg-muted rounded-md text-sm text-muted-foreground">
          <p className="font-medium mb-2">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Minimum 6 characters long</li>
            <li>Combination of letters, numbers, or special characters recommended</li>
          </ul>
        </div>

        <Auth
          supabaseClient={supabase}
          appearance={appearance}
          theme={theme === 'dark' ? 'dark' : 'light'}
          localization={{
            variables: {
              sign_up: {
                button_label: "Sign Up",
                link_text: "Already have an account? Sign in",
                email_label: "Email",
                password_label: "Password"
              }
            }
          }}
          providers={[]}
          view="sign_up"
          redirectTo={`${window.location.origin}/signup`}
          onlyThirdPartyProviders={false}
          showLinks={false}
        />
        <div className="mt-4 text-center">
          <Button
            variant="link"
            className="text-primary hover:text-primary/90"
            onClick={() => navigate("/login")}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </div>
  );
};