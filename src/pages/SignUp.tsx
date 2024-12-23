import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SignUp = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'influencer' | 'business'>('influencer');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ user_type: userType })
            .eq('id', session.user.id);

          if (error) {
            toast.error("Error updating profile: " + error.message);
            return;
          }

          // Redirect based on user type
          navigate(userType === 'influencer' ? '/influencer' : '/client');
        } catch (error: any) {
          console.error('Error updating profile:', error);
          toast.error('Failed to complete signup. Please try again.');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, userType]);

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
          Create your account
        </h2>
      </div>

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
                  link_text: "Already have an account? Sign in"
                }
              }
            }}
            theme="light"
            providers={[]}
            view="sign_up"
            redirectTo={window.location.origin}
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
    </div>
  );
};

export default SignUp;