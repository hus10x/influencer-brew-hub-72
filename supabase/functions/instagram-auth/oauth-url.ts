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
    
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth`;
    
    console.log('Using redirect URI:', redirectUri);
    console.log('Using app ID:', appId);
    
    // Construct URL exactly as per Instagram API docs
    const instagramUrl = "https://api.instagram.com/oauth/authorize" +
      `?client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
      "&response_type=code" +
      `&state=${state}`;

    console.log('Generated Instagram OAuth URL:', instagramUrl);

    return new Response(
      JSON.stringify({ 
        url: instagramUrl, 
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