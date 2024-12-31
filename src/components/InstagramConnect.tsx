import { useState } from "react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InstagramConnect = () => {
  const { isLoading: authIsLoading, initializeInstagramAuth } = useInstagramAuth();
  const { isConnected } = useInstagramConnection();
  const [efLoading, setEfLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setEfLoading(true);

      const { data: { user }, error } = await supabase.auth.getUser(); 
      if (error) {
        console.error("Error getting user:", error);
        toast.error("An error occurred while getting user data.");
        setEfLoading(false);
        return;
      }

      const userId = user.id; 

      const { data, error: invokeError } = await supabase.functions.invoke('instagram-auth/oauth-url', {
        headers: { 
          'x-user-id': userId, 
        },
      });

      if (invokeError) {
        console.error("Error invoking function:", invokeError);
        toast.error("An error occurred while generating the OAuth URL. Please try again.");
        setEfLoading(false);
        return;
      }

      // Handle successful response from oauth-url Edge Function
      if (data && data.message === 'Successfully generated Instagram OAuth URL') {
        window.location.href = data.url; // Redirect to the generated Instagram OAuth URL
      } else {
        console.error("Unexpected response from oauth-url Edge Function:", data);
        toast.error("An unexpected error occurred. Please try again.");
      }

    } catch (error) {
      console.error("Error in InstagramConnect:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setEfLoading(false);
    }
  };

  return (
    <ConnectButton 
      isConnected={isConnected} 
      isLoading={authIsLoading || efLoading} 
      onClick={handleInstagramConnect} 
    />
  );
};
