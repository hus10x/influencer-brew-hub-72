import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      // Generate a random state for security
      const state = crypto.randomUUID();
      localStorage.setItem('instagram_oauth_state', state);
      
      // Build the Instagram OAuth URL directly
      const appId = '493461117098279'; // Your Instagram App ID
      const redirectUri = 'https://preview--influencer-brew-hub-72.lovable.app/';
      
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
        `&state=${state}`;
      
      console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInstagramConnect}
      disabled={isLoading}
      className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 hover:bg-primary/90"
      size="lg"
    >
      <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
      {isLoading ? 'Connecting...' : 'Connect Instagram'}
      <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
    </Button>
  );
};