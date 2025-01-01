import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useInstagramAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const initializeInstagramAuth = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Instagram connection process...');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Please log in to connect your Instagram account');
        navigate('/login');
        return null;
      }

      // Generate and store OAuth state (unchanged)
      const state = crypto.randomUUID();
      console.log('Storing OAuth state...');

      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state,
          user_id: session.user.id,
          redirect_path: window.location.pathname
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        throw new Error('Failed to initialize Instagram connection');
      }

      return { state, appId: '950071187030893' };
    } catch (error) {
      console.error('Error in Instagram auth:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Call Edge Function after hook initialization (new)
  useEffect(() => {
    const initiateConnection = async () => {
      const authData = await initializeInstagramAuth();

      if (authData) {
        try {
          const { data, error } = await supabase.functions.invoke('instagram-auth/oauth-url', {
            headers: {
              Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
          });

          if (error) {
            console.error('Error calling Edge Function:', error);
            return;
          }

          const { url } = data;
          window.location.href = url; // Redirect to Instagram
        } catch (error) {
          console.error("Error invoking function", error)
        }
      }
    };

    initiateConnection();
  }, []); // Empty dependency array ensures this runs only once on mount

  return {
    isLoading,
    initializeInstagramAuth
  };
};
