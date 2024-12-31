import { useState } from "react";
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

      console.log('Session found, calling Edge Function...');

      // Call the Edge Function to get the OAuth URL
      const { data, error } = await supabase.functions.invoke('instagram-auth/oauth-url', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error generating OAuth URL:', error);
        toast.error(error.message || 'Failed to generate OAuth URL');
        return null;
      }

      console.log('Edge Function response:', data);

      if (!data?.state || !data?.url) {
        console.error('Invalid response from Edge Function:', data);
        toast.error('Failed to initialize Instagram authentication');
        return null;
      }

      // Store the state in localStorage for verification
      localStorage.setItem('instagram_oauth_state', data.state);
      console.log('Stored state in localStorage:', data.state);
      
      // Redirect to Instagram OAuth URL
      console.log('Redirecting to Instagram URL:', data.url);
      window.location.href = data.url;

      return { state: data.state, appId: '950071187030893' };
    } catch (error) {
      console.error('Error in Instagram auth:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    initializeInstagramAuth
  };
};