import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InstagramService } from "@/services/instagram";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useInstagramConnection = () => {
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
          await disconnectInstagram(user.id);
        }
      }
    } catch (error) {
      console.error('Error checking Instagram connection:', error);
    }
  };

  const disconnectInstagram = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({
          instagram_connected: false,
          instagram_access_token: null,
          instagram_username: null,
          instagram_id: null,
          instagram_account_type: null,
          instagram_token_expires_at: null
        })
        .eq('id', userId);
    } catch (error) {
      console.error('Error disconnecting Instagram:', error);
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
      console.log('Generated OAuth state:', state);
      
      const { error: stateError } = await supabase
        .from('instagram_oauth_states')
        .insert({
          state: state,
          user_id: user.id,
          redirect_path: '/influencer'
        });

      if (stateError) {
        console.error('Error storing OAuth state:', stateError);
        throw new Error('Failed to initialize Instagram connection');
      }

      // Store state in localStorage for additional verification
      localStorage.setItem('instagram_oauth_state', state);

      // Construct Instagram OAuth URL with proper encoding
      const params = new URLSearchParams({
        enable_fb_login: '0',
        force_authentication: '1',
        client_id: '950071187030893',
        redirect_uri: 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback',
        response_type: 'code',
        scope: 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish',
        state: state
      });

      const instagramUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;
      console.log('Redirecting to Instagram auth URL:', instagramUrl);
      
      window.location.href = instagramUrl;
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isConnected,
    handleInstagramConnect
  };
};