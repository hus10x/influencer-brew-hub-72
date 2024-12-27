import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('INSTAGRAM_APP_ID');
    if (!appId) {
      console.error('Instagram App ID not configured');
      throw new Error('Instagram App ID not configured');
    }

    const { state } = await req.json();
    if (!state) {
      throw new Error('State parameter is required');
    }
    
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback`;
    
    console.log('Generating Instagram OAuth URL with:', {
      appId: appId ? 'present' : 'missing',
      redirectUri,
      state
    });

    const scope = [
      'instagram_business_basic',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
      'instagram_business_content_publish'
    ].join('%2C');

    // Construct URL exactly as provided
    const instagramUrl = `https://www.instagram.com/oauth/authorize` +
      `?enable_fb_login=0` +
      `&force_authentication=1` +
      `&client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${scope}` +
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