import { useState } from "react";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { InstagramMetrics } from "./instagram/InstagramMetrics";
import { FacebookPageSelect } from "./instagram/FacebookPageSelect";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";

export const InstagramConnect = () => {
  const { isConnected } = useInstagramConnection();
  const { isLoading, initializeInstagramAuth } = useInstagramAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPageSelect, setShowPageSelect] = useState(false);
  const [userAccessToken, setUserAccessToken] = useState<string>("");

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
      console.log('Redirecting to Facebook OAuth URL...');
      window.location.href = authUrl;

    } catch (error) {
      console.error("Error in Instagram connect:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePageSelected = async (page: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          facebook_page_id: page.id,
          facebook_page_name: page.name,
          facebook_page_access_token: page.access_token,
          instagram_id: page.instagram_business_account.id,
          instagram_connected: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success("Successfully connected Instagram Business account");
      setShowPageSelect(false);
    } catch (error) {
      console.error("Error saving page selection:", error);
      toast.error("Failed to save page selection");
    }
  };

  return (
    <div className="space-y-8">
      {showPageSelect ? (
        <FacebookPageSelect
          userAccessToken={userAccessToken}
          onPageSelected={handlePageSelected}
        />
      ) : (
        <ConnectButton 
          isConnected={isConnected}
          isLoading={isLoading || isProcessing}
          onClick={handleInstagramConnect}
        />
      )}
      {isConnected && <InstagramMetrics />}
    </div>
  );
};