import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OAuth URL generation...');

    // Validate request
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      console.error('Missing user ID in request headers');
      return new Response(
        JSON.stringify({ error: 'Missing user ID in request headers' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get required environment variables
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      console.error('Missing FACEBOOK_APP_ID environment variable');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get request body
    const { state } = await req.json();
    if (!state) {
      console.error('Missing state parameter in request body');
      return new Response(
        JSON.stringify({ error: 'Missing state parameter' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define required scopes for business functionality
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'instagram_manage_messages',
      'pages_show_list',
      'pages_read_engagement'
    ].join(',');

    // Construct Facebook OAuth URL
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-auth-callback`;
    console.log('Using redirect URI:', redirectUri);

    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}` +
      `&scope=${scopes}` +
      `&response_type=code` +
      `&extras=${encodeURIComponent(JSON.stringify({setup:{channel:"IG_API_ONBOARDING"}}))}`;

    console.log('Generated Facebook OAuth URL successfully');

    return new Response(
      JSON.stringify({ url: authUrl }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});