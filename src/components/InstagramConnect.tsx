import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkConnectionStatus = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            toast.error('Authentication error. Please try logging in again.');
            navigate('/login');
          }
          return;
        }

        if (!sessionData.session) {
          console.log('No active session found');
          if (mounted) {
            navigate('/login');
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('instagram_connected, instagram_username, instagram_account_type')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking Instagram connection:', profileError);
          return;
        }

        if (mounted && profile?.instagram_connected) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking Instagram connection:', error);
      }
    };

    checkConnectionStatus();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleInstagramConnect = async () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Please log in to connect your Instagram account');
        navigate('/login');
        return;
      }

      if (!session) {
        console.error('No active session');
        toast.error('Please log in to connect your Instagram account');
        navigate('/login');
        return;
      }

      const state = crypto.randomUUID();
      
      console.log('Storing OAuth state...');
      
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
          user_id: session.user.id,
          redirect_path: window.location.pathname
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        throw new Error('Failed to initialize Instagram connection');
      }
      
      const appId = '950071187030893';
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';
      
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=pages_show_list,instagram_basic,instagram_manage_comments,instagram_manage_insights,instagram_content_publish,instagram_manage_messages,pages_read_engagement" +
        `&state=${state}` +
        "&v=21.0";  // Updated to latest API version (v21.0)
      
      console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
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