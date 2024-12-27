import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InstagramCallback = () => {
  const [isProcessing, setIsProcessing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorReason = params.get('error_reason');

        if (error || errorReason) {
          console.error('Instagram OAuth error:', error, errorReason);
          toast.error(`Authentication failed: ${error || errorReason}`);
          navigate('/influencer');
          return;
        }

        if (!code || !state) {
          console.error('Missing code or state');
          toast.error('Invalid authentication response');
          navigate('/influencer');
          return;
        }

        // Verify state matches what we stored
        const storedState = localStorage.getItem('instagram_oauth_state');
        if (state !== storedState) {
          console.error('State mismatch', { received: state, stored: storedState });
          toast.error('Invalid authentication state');
          navigate('/influencer');
          return;
        }

        // Clear stored state
        localStorage.removeItem('instagram_oauth_state');

        // Exchange code for token using our Edge Function
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error('Authentication session expired');
          navigate('/login');
          return;
        }

        const { data, error: exchangeError } = await supabase.functions.invoke(
          'instagram-auth/callback',
          {
            body: { code, state },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        );

        if (exchangeError) {
          console.error('Token exchange error:', exchangeError);
          toast.error('Failed to complete authentication');
          navigate('/influencer');
          return;
        }

        console.log('Instagram authentication successful:', data);
        toast.success('Successfully connected to Instagram!');
        navigate('/influencer');
      } catch (error) {
        console.error('Callback handling error:', error);
        toast.error('Failed to process authentication');
        navigate('/influencer');
      } finally {
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (isProcessing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Connecting to Instagram...</h2>
          <p className="text-muted-foreground">Please wait while we complete the connection.</p>
        </div>
      </div>
    );
  }

  return null;
};