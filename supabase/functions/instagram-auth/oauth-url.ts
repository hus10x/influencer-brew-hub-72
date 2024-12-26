import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      throw new Error('Facebook App ID not configured');
    }

    const { state } = await req.json();
    if (!state) {
      throw new Error('State parameter is required');
    }
    
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback`;
    
    // Construct URL exactly as provided by Meta console
    const instagramUrl = "https://www.instagram.com/oauth/authorize" + 
      `?client_id=${appId}` +
      "&enable_fb_login=0" +
      "&force_authentication=1" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
      `&state=${state}`;

    return new Response(
      JSON.stringify({ url: instagramUrl }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})