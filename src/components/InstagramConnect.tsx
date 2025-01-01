import { useState } from "react";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { InstagramMetrics } from "./instagram/InstagramMetrics";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";

export const InstagramConnect = () => {
  const { isConnected } = useInstagramConnection();
  const { isLoading, initializeInstagramAuth } = useInstagramAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsProcessing(true);
      console.log('Starting Instagram connection process...');

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user:", userError);
        toast.error("Please log in to connect your Instagram account");
        return;
      }

      // Initialize Instagram auth and get URL
      const authUrl = await initializeInstagramAuth();
      if (!authUrl) {
        console.error("Failed to generate Instagram auth URL");
        toast.error("Failed to initialize Instagram connection");
        return;
      }

      // Redirect to Instagram
      console.log('Redirecting to Instagram OAuth URL...');
      window.location.href = authUrl;

    } catch (error) {
      console.error("Error in Instagram connect:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <ConnectButton 
        isConnected={isConnected}
        isLoading={isLoading || isProcessing}
        onClick={handleInstagramConnect}
      />
      {isConnected && <InstagramMetrics />}
    </div>
  );
};