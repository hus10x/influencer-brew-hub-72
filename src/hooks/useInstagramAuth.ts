import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useInstagramAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const initializeInstagramAuth = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Instagram auth initialization...');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError);
        toast.error('Please log in to connect your Instagram account');
        return null;
      }

      // Generate state for security
      const state = crypto.randomUUID();
      console.log('Generated state:', state);

      // Store state in database with improved error handling
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state,
          user_id: session.user.id,
          redirect_path: window.location.pathname
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        toast.error('Failed to initialize Instagram connection');
        return null;
      }

      // Get OAuth URL from Edge Function with improved error handling
      const { data, error: functionError } = await supabase.functions.invoke('instagram-auth-oauth-url', {
        body: { state },
        headers: { 
          Authorization: `Bearer ${session.access_token}`,
          'x-user-id': session.user.id,
        },
      });

      if (functionError) {
        console.error('Error calling Edge Function:', functionError);
        toast.error('Failed to generate Instagram connection URL');
        return null;
      }

      if (!data?.url) {
        console.error('No URL returned from Edge Function');
        toast.error('Failed to generate Instagram connection URL');
        return null;
      }

      console.log('Successfully generated Instagram OAuth URL');
      return data.url;

    } catch (error) {
      console.error('Error in Instagram auth:', error);
      toast.error('An unexpected error occurred');
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