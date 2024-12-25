import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting OAuth URL generation...');
    
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      console.error('Facebook App ID not configured');
      throw new Error('Facebook App ID not configured');
    }

    // Generate a random state parameter for security
    const state = crypto.randomUUID();
    
    // Facebook OAuth URL with required scopes for Instagram Graph API
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback`;
    
    console.log('Using redirect URI:', redirectUri);
    console.log('Using app ID:', appId);
    
    const facebookUrl = "https://www.facebook.com/v19.0/dialog/oauth" + 
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&scope=instagram_basic,instagram_content_publish,instagram_manage_insights,pages_show_list,pages_read_engagement" +
      `&state=${state}`;

    console.log('Generated Facebook OAuth URL:', facebookUrl);

    return new Response(
      JSON.stringify({ 
        url: facebookUrl, 
        state: state 
      }),
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
      JSON.stringify({ 
        error: error.message || 'Failed to generate OAuth URL'
      }),
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