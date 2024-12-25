import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already connected to Instagram
  const { data: profile, isLoading: isCheckingConnection } = useQuery({
    queryKey: ['instagram-connection'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('instagram_connected, instagram_handle')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error checking Instagram connection:', error);
        return null;
      }

      return data;
    }
  });

  const handleInstagramConnect = async () => {
    try {
      console.log('Starting Instagram connection process...');
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate a random state for security
      const state = crypto.randomUUID();
      
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
      
      // Build the Instagram OAuth URL
      const appId = '493461117098279';
      const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.com/functions/v1/instagram-auth/callback';
      
      const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
        `?client_id=${appId}` +
        "&enable_fb_login=0" +
        "&force_authentication=1" +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        "&response_type=code" +
        "&scope=instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,instagram_manage_insights" +
        `&state=${state}`;
      
      console.log('Redirecting to Instagram OAuth URL:', instagramUrl);
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
      setIsLoading(false);
    }
  };

  // If already connected, don't show the button
  if (profile?.instagram_connected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Instagram className="w-4 h-4" />
        Connected as @{profile.instagram_handle}
      </div>
    );
  }

  return (
    <Button
      onClick={handleInstagramConnect}
      disabled={isLoading || isCheckingConnection}
      className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 hover:bg-primary/90"
      size="lg"
    >
      <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
      {isLoading ? 'Connecting...' : isCheckingConnection ? 'Checking...' : 'Connect Instagram'}
      <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
    </Button>
  );
};