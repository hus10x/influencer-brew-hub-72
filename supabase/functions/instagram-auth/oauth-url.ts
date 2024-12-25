import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('INSTAGRAM_APP_ID');
    if (!appId) {
      throw new Error('Instagram App ID not configured');
    }

    // Instagram OAuth URL with required scopes for Instagram Graph API
    const instagramUrl = "https://api.instagram.com/oauth/authorize" + 
      `?client_id=${appId}` +
      "&redirect_uri=https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth" +
      "&response_type=code" +
      "&scope=instagram_basic,instagram_content_publish,instagram_manage_insights" +
      "&state=instagram";

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