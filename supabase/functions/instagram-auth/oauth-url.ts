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

    // Facebook OAuth URL with required scopes for Instagram Graph API
    const facebookUrl = "https://www.facebook.com/v19.0/dialog/oauth" + 
      `?client_id=${appId}` +
      "&redirect_uri=https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth" +
      "&response_type=code" +
      "&scope=instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list" +
      "&state=instagram";

    console.log('Generated Facebook OAuth URL:', facebookUrl);

    return new Response(
      JSON.stringify({ url: facebookUrl }),
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