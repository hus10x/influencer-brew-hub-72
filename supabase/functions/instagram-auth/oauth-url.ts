import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Use the hardcoded App ID that works
    const appId = '950071187030893';
    
    const { state } = await req.json();
    if (!state) {
      console.error('No state parameter provided');
      throw new Error('State parameter is required');
    }
    
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback`;
    
    console.log('Generating Instagram OAuth URL with:', {
      appId,
      redirectUri,
      state
    });

    // Construct URL exactly as provided
    const instagramUrl = `https://www.instagram.com/oauth/authorize` +
      `?enable_fb_login=0` +
      `&force_authentication=1` +
      `&client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish` +
      `&state=${state}`;

    console.log('Generated Instagram URL:', instagramUrl);

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