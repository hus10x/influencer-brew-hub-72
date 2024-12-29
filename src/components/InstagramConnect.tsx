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
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth';
    
    // Construct URL exactly as per Instagram API docs
    const instagramUrl = "https://api.instagram.com/oauth/authorize" +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
      "&response_type=code" +
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