import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      // Direct Instagram Business OAuth URL with all required scopes
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        "?enable_fb_login=0" +
        "&force_authentication=1" +
        "&client_id=2261088610942492" +
        "&redirect_uri=https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth" +
        "&response_type=code" +
        "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish";
      
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
    } finally {
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