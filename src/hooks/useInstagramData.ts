import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface InstagramUserData {
  id: string;
  username: string;
  followers_count: number;
  media_count: number;
  profile_picture_url: string;
}

interface InstagramMedia {
  id: string;
  caption?: string;
  media_type: string;
  media_url: string;
  timestamp: string;
  permalink: string;
}

export const useInstagramData = () => {
  const fetchInstagramData = async () => {
    console.log('Fetching Instagram data...');
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('instagram_access_token, instagram_username')
      .single();

    if (!profile?.instagram_access_token) {
      console.error('No Instagram access token found');
      throw new Error('No Instagram access token found');
    }

    console.log('Found access token, fetching user data...');

    // Fetch user data with access token in URL (as per Instagram API docs)
    const userResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,followers_count,media_count,profile_picture_url&access_token=${profile.instagram_access_token}`
    );

    if (!userResponse.ok) {
      const error = await userResponse.json();
      console.error('Instagram API error:', error);
      throw new Error(`Failed to fetch Instagram user data: ${error.message}`);
    }

    const userData: InstagramUserData = await userResponse.json();
    console.log('User data fetched:', userData);

    // Fetch media data with access token in URL
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v21.0/me/media?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${profile.instagram_access_token}`
    );

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json();
      console.error('Instagram API error:', error);
      throw new Error(`Failed to fetch Instagram media: ${error.message}`);
    }

    const mediaData = await mediaResponse.json();
    console.log('Media data fetched:', mediaData);

    return {
      user: userData,
      media: mediaData.data as InstagramMedia[]
    };
  };

  return useQuery({
    queryKey: ['instagram-data'],
    queryFn: fetchInstagramData,
    meta: {
      error: (error: Error) => {
        toast.error(error.message);
      }
    }
  });
};