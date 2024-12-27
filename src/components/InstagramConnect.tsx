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
    
    const scopes = [
      'user_profile', // Use this instead of instagram_basic
      'user_media'    // For basic media access
    ].join(',');

    // Use this exact URL structure
    const instagramUrl = "https://api.instagram.com/oauth/authorize?" +
      `client_id=${appId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${scopes}&` +
      `response_type=code&` +
      `state=${state}`;
    
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