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
      const { data: { user }, error } = await supabase.auth.getUser(); 
      if (error) {
        console.error("Error getting user:", error);
        toast.error("An error occurred while getting user data.");
        return;
      }

      const userId = user.id; 

      setEfLoading(true); 
      const authData = await initializeInstagramAuth(); 
      if (!authData) { 
        toast.error("Error initializing instagram auth"); 
        setEfLoading(false); 
        return; 
      }

      const { data, error } = await supabase.functions.invoke('instagram-auth/oauth-url', {
        headers: { 
          'x-user-id': userId, 
        },
      });

      if (error) {
        console.error("Error invoking function", error);
        toast.error("An unexpected error occurred. Please try again.");
        setEfLoading(false);
      } else {
        // Redirect to the generated Instagram OAuth URL
        window.location.href = data; 
      }

    } catch (error) {
      console.error("Error invoking function", error);
      toast.error("An unexpected error occurred. Please try again.");
      setEfLoading(false);
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
