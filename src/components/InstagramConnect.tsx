import { useState } from "react";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InstagramConnect = () => {
  const { isConnected } = useInstagramConnection();
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Instagram connection process...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        toast.error("Please log in to connect your Instagram account");
        return;
      }

      // Generate state for security
      const state = crypto.randomUUID();
      console.log('Generated state:', state);

      // Store state in database
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state,
          user_id: user.id,
          redirect_path: window.location.pathname
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        toast.error('Failed to initialize Instagram connection');
        return;
      }

      // Get OAuth URL from Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('instagram-auth/oauth-url', {
        body: { state },
        headers: { 
          'x-user-id': user.id,
        },
      });

      if (functionError) {
        console.error("Error invoking function:", functionError);
        toast.error("An error occurred while generating the OAuth URL");
        return;
      }

      if (!data?.url) {
        console.error("No URL returned from Edge Function");
        toast.error("Failed to generate Instagram connection URL");
        return;
      }

      console.log('Redirecting to Instagram OAuth URL...');
      window.location.href = data.url;

    } catch (error) {
      console.error("Error in Instagram connect:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ConnectButton 
      isConnected={isConnected}
      isLoading={isLoading}
      onClick={handleInstagramConnect}
    />
  );
};