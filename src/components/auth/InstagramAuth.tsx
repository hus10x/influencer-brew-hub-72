import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { InstagramAuthState } from "@/types/instagram";
import { toast } from "sonner";

export const InstagramAuth = () => {
  const [state, setState] = useState<InstagramAuthState>({
    isConnected: false,
    isLoading: false,
  });

  const handleInstagramConnect = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast.error("Please login first");
        return;
      }

      const { data: configData, error: configError } = await supabase.functions.invoke(
        'instagram-auth/config',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      if (configError || !configData?.appId) {
        console.error('Config error:', configError);
        toast.error("Failed to load Instagram configuration");
        return;
      }

      // Generate a random state for security
      const state = crypto.randomUUID();
      
      // Store the state in Supabase
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state,
          user_id: session.session.user.id,
          redirect_path: '/influencer'
        });

      if (stateError) {
        console.error('State storage error:', stateError);
        toast.error("Failed to initialize Instagram connection");
        return;
      }

      // Construct Instagram OAuth URL using the config from our Edge Function
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';
      const scope = 'instagram_basic,instagram_content_publish';
      
      const instagramAuthUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${configData.appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=instagram_basic,instagram_content_publish" +
        `&state=${state}`;

      // Open Instagram auth window
      window.location.href = instagramAuthUrl;
      
    } catch (error) {
      console.error('Instagram auth error:', error);
      toast.error("Failed to connect to Instagram");
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  return (
    <Button 
      onClick={handleInstagramConnect}
      disabled={state.isLoading}
      className="w-full"
    >
      {state.isLoading ? 'Connecting...' : 'Connect Instagram'}
    </Button>
  );
};