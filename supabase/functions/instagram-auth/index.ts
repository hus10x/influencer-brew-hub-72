import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Instagram auth function called');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    console.log('URL Parameters:', { code: !!code, state, error });
    
    if (error) {
      console.error('Instagram OAuth error:', error);
      return new Response(
        JSON.stringify({ error: `Instagram OAuth error: ${error}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return new Response(
        JSON.stringify({ error: 'Invalid OAuth parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!appSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Fetching OAuth state from database...');
    const { data: oauthState, error: stateError } = await supabase
      .from('instagram_oauth_states')
      .select('user_id, used')
      .eq('state', state)
      .single();

    if (stateError || !oauthState) {
      console.error('Invalid or expired OAuth state:', stateError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired OAuth state' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (oauthState.used) {
      console.error('OAuth state has already been used');
      return new Response(
        JSON.stringify({ error: 'This authentication link has already been used' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Found valid OAuth state for user:', oauthState.user_id);

    // Mark the state as used immediately
    const { error: updateStateError } = await supabase
      .from('instagram_oauth_states')
      .update({ used: true })
      .eq('state', state)
      .eq('used', false);

    if (updateStateError) {
      console.error('Error marking OAuth state as used:', updateStateError);
      return new Response(
        JSON.stringify({ error: 'Failed to process authentication' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Exchange the code for an access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: appId,
        client_secret: appSecret,
        grant_type: 'authorization_code',
        redirect_uri: `${supabaseUrl}/functions/v1/instagram-auth`,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to exchange code for token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful');

    // Get Instagram profile
    console.log('Fetching Instagram profile...');
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.error('Profile fetch failed:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch Instagram profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const profile = await profileResponse.json();
    console.log('Profile fetch successful:', profile.username);

    // Update user profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_handle: profile.username,
        instagram_connected: true,
        instagram_business_account: true,
        instagram_access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', oauthState.user_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update profile' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('Successfully connected Instagram account');
    
    // Return success response with HTML that will close the window and redirect the opener
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Instagram Connected</title>
          <script>
            window.opener.location.href = '/influencer';
            window.close();
          </script>
        </head>
        <body>
          <h1>Successfully connected Instagram!</h1>
          <p>You can close this window now.</p>
        </body>
      </html>
      `,
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html',
        },
      }
    );

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process Instagram authentication' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})