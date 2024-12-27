import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { InstagramService } from "@/services/instagram";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('instagram_connected, instagram_username, instagram_access_token')
        .eq('id', user.id)
        .single();

      if (profile?.instagram_connected && profile?.instagram_access_token) {
        const instagramService = new InstagramService(profile.instagram_access_token);
        try {
          await instagramService.getUserProfile();
          setIsConnected(true);
        } catch (error) {
          console.error('Error verifying Instagram connection:', error);
          await supabase
            .from('profiles')
            .update({
              instagram_connected: false,
              instagram_access_token: null
            })
            .eq('id', user.id);
        }
      }
    } catch (error) {
      console.error('Error checking Instagram connection:', error);
    }
  };

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to connect your Instagram account');
        navigate('/login');
        return;
      }

      const state = crypto.randomUUID();
      
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
          user_id: user.id,
          redirect_path: '/influencer'
        });

      if (stateError) {
        throw new Error('Failed to initialize Instagram connection');
      }
      
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';
      
      console.log('Calling config endpoint...');
      const { data, error: configError } = await supabase.functions.invoke('instagram-auth/config', {
        method: 'POST'
      });
      
      console.log('Config response:', data);
      
      if (configError || !data?.appId) {
        console.error('Config error:', configError);
        console.error('Config data:', data);
        throw new Error('Failed to load Instagram configuration');
      }

      const instagramUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${data.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish&state=${state}`;
      
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
      setIsLoading(false);
    }
  };

  if (isConnected) {
    return (
      <Button
        disabled
        className="group relative flex items-center gap-2 overflow-hidden px-6 bg-green-500 hover:bg-green-600"
        size="lg"
      >
        <Instagram className="w-5 h-5" />
        Connected to Instagram
      </Button>
    );
  }

  return (
    <Button
      onClick={handleInstagramConnect}
      disabled={isLoading}
      className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 hover:bg-primary/90"
      size="lg"
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
      )}
      {isLoading ? 'Connecting...' : 'Connect Instagram'}
      <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
    </Button>
  );
};