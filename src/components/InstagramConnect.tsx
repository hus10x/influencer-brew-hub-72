import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Listen for messages from the popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS') {
        console.log('Instagram auth success:', event.data);
        toast.success('Successfully connected to Instagram!');
        // Reload the page to reflect the new connection status
        window.location.reload();
      } else if (event.data.type === 'INSTAGRAM_AUTH_ERROR') {
        console.error('Instagram auth error:', event.data.error);
        toast.error(`Failed to connect to Instagram: ${event.data.error}`);
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleInstagramConnect = async () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user found');
        throw new Error('User not authenticated');
      }
      console.log('Authenticated user:', user.id);

      // Generate a random state for security
      const state = crypto.randomUUID();
      console.log('Generated OAuth state:', state);
      
      // Store the state in the database
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
          user_id: user.id
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        throw new Error('Failed to initialize Instagram connection');
      }
      console.log('Successfully stored OAuth state in database');
      
      // Build the Instagram OAuth URL
      const appId = '1314871332853944';
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.functions.supabase.co/instagram-auth';
      
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=instagram_basic,instagram_content_publish" +
        `&state=${state}`;
      
      console.log('Generated Instagram OAuth URL:', instagramUrl);

      // Open the Instagram auth URL in a popup window
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      
      window.open(
        instagramUrl,
        'instagram-oauth-auth',
        `width=${width},height=${height},top=${top},left=${left}`
      );
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