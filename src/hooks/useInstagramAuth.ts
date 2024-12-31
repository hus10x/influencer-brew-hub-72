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

      const state = crypto.randomUUID();
      console.log('Storing OAuth state...');
      
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
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

  return {
    isLoading,
    initializeInstagramAuth
  };
};