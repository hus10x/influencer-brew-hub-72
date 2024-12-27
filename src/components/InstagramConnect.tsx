import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";

export const InstagramConnect = () => {
  const { isLoading, initializeInstagramAuth } = useInstagramAuth();
  const { isConnected } = useInstagramConnection();

  const handleInstagramConnect = async () => {
    const authData = await initializeInstagramAuth();
    
    if (!authData) return;
    
    const { state, appId } = authData;
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';
    
    // Properly encode each parameter
    const scope = encodeURIComponent(
      "instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish"
    );
    
    // Use the exact URL structure with properly encoded parameters
    const instagramUrl = "https://www.instagram.com/oauth/authorize?" +
      "enable_fb_login=0&" +
      "force_authentication=1&" +
      `client_id=${encodeURIComponent(appId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      "response_type=code&" +
      `scope=${scope}`;
    
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