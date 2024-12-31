import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './response.ts';

serve(async (req) => {
  // Handle CORS 
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OAuth URL generation...');

    const userId = req.headers.get('x-user-id'); 
    if (!userId) {
      return new Response('Missing user ID in request headers', { status: 400 }); 
    }

    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      return new Response('Missing FACEBOOK_APP_ID environment variable', { status: 500 });
    }

    const state = crypto.randomUUID();

    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth`; 

    console.log('Using redirect URI:', redirectUri);
    console.log('Using app ID:', appId);

    const instagramUrl = `https://api.instagram.com/oauth/authorize?` +
      `client_id=${appId}` +
      "&enable_fb_login=0" +
      "&force_authentication=1" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
      `&state=${state}`;

    console.log('Generated Instagram OAuth URL:', instagramUrl);

    return new Response(JSON.stringify({ url: instagramUrl }), { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json', 
        ...corsHeaders 
      } 
    }); 

  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response('Error generating OAuth URL', { status: 500 }); 
  }
});
