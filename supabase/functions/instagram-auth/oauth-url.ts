import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './response.ts';

serve(async (req) => {
  // Handle CORS (unchanged)
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OAuth URL generation...');

    // Get the Authorization header (unchanged)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      // ... (unchanged error handling)
    }

    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      // ... (unchanged error handling)
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

    // ** KEY CHANGE: Return a redirect response instead of JSON **
    return new Response(null, {
      status: 302, // Redirect status code
      headers: {
        Location: instagramUrl, // Set the redirect URL
        ...corsHeaders
      },
    });

  } catch (error) {
    // ... (unchanged error handling)
  }
});
