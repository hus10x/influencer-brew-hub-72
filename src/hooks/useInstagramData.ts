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
    const { data: profile } = await supabase
      .from('profiles')
      .select('instagram_access_token, instagram_username')
      .single();

    if (!profile?.instagram_access_token) {
      throw new Error('No Instagram access token found');
    }

    // Fetch user data
    const userResponse = await fetch(
      `https://graph.instagram.com/v21.0/me?fields=id,username,followers_count,media_count,profile_picture_url&access_token=${profile.instagram_access_token}`
    );

    if (!userResponse.ok) {
      throw new Error('Failed to fetch Instagram user data');
    }

    const userData: InstagramUserData = await userResponse.json();

    // Fetch media data
    const mediaResponse = await fetch(
      `https://graph.instagram.com/v21.0/${userData.id}/media?fields=id,caption,media_type,media_url,timestamp,permalink&access_token=${profile.instagram_access_token}`
    );

    if (!mediaResponse.ok) {
      throw new Error('Failed to fetch Instagram media');
    }

    const mediaData = await mediaResponse.json();

    return {
      user: userData,
      media: mediaData.data as InstagramMedia[]
    };
  };

  return useQuery({
    queryKey: ['instagram-data'],
    queryFn: fetchInstagramData,
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
};