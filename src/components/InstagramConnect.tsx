import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInstagramConnect = async () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        toast.error('Please log in to connect your Instagram account');
        navigate('/login');
        return;
      }

      // Generate a random state for security
      const state = crypto.randomUUID();
      
      console.log('Storing OAuth state...');
      
      // Store the state in the database with a clear expiration
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
          user_id: user.id,
          expires_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour expiration
          used: false
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        throw new Error('Failed to initialize Instagram connection');
      }
      
      // Build the Instagram OAuth URL with all required scopes
      const appId = '1314871332853944';
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';
      
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=instagram_basic,instagram_content_publish,instagram_manage_comments,instagram_manage_insights" +
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