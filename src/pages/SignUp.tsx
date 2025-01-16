import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { SignUpForm } from "@/components/auth/SignUpForm";

const SignUp = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'influencer' | 'business'>('influencer');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              user_type: userType,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (error) {
            console.error('Error creating profile:', error);
            toast.error("Error updating profile: " + error.message);
            return;
          }

          // If user type is influencer, create influencer record
          if (userType === 'influencer') {
            const { error: influencerError } = await supabase
              .from('influencers')
              .insert({
                id: session.user.id,
                followers_count: 0,
                engagement_rate: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (influencerError) {
              console.error('Error creating influencer:', influencerError);
              toast.error("Error creating influencer profile");
              return;
            }
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
    <AuthLayout>
      <AuthHeader title="Create your account" />
      <SignUpForm userType={userType} setUserType={setUserType} />
    </AuthLayout>
  );
};

export default SignUp;