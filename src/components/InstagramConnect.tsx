import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";

export const InstagramConnect = () => {
  const { isLoading, initializeInstagramAuth } = useInstagramAuth();
  const { isConnected } = useInstagramConnection();

  const handleInstagramConnect = async () => {
    const authData = await initializeInstagramAuth();
    
    if (!authData) return;
    
    const { state } = authData;
    // Update redirect URI to match Edge Function path
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth';
    
    // Properly encode each parameter
    const scope = encodeURIComponent(
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish"
    );
    
    // Use the exact URL structure with properly encoded parameters
    const instagramUrl = "https://api.instagram.com/oauth/authorize?" + 
      `client_id=${appId}` +
      "&enable_fb_login=0" +
      "&force_authentication=1" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&scope=pages_show_list,instagram_basic,instagram_manage_comments,instagram_manage_insights,instagram_content_publish,instagram_manage_messages,pages_read_engagement" +
      `&state=${state}`;
    
    console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
    window.location.href = instagramUrl;
  };

  return (
    <ConnectButton
      isConnected={isConnected}
      isLoading={isLoading}
      onClick={handleInstagramConnect}
    />
  );
};
