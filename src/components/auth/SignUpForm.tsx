import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SignUpFormProps {
  userType: 'influencer' | 'business';
  setUserType: (type: 'influencer' | 'business') => void;
}

export const SignUpForm = ({ userType, setUserType }: SignUpFormProps) => {
  const navigate = useNavigate();

  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10">
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

        <div className="mb-4 p-4 bg-gray-50 rounded-md text-sm text-gray-600">
          <p className="font-medium mb-2">Password Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Minimum 6 characters long</li>
            <li>Combination of letters, numbers, or special characters recommended</li>
          </ul>
        </div>

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
          }}
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
          theme="light"
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