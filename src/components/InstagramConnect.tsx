import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      // Instagram OAuth URL with required scopes for Instagram Graph API
      const instagramUrl = "https://api.instagram.com/oauth/authorize" + 
        "?client_id=YOUR_APP_ID" +
        "&redirect_uri=https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth" +
        "&response_type=code" +
        "&scope=instagram_basic,instagram_content_publish,instagram_manage_insights" +
        "&state=instagram";
      
      console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
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