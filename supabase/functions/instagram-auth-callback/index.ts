import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Instagram auth callback function called');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorReason = url.searchParams.get('error_reason');

    console.log('Received params:', { 
      code: code ? 'present' : 'missing',
      state: state ? 'present' : 'missing',
      error,
      errorReason 
    });

    if (error) {
      console.error('Error from Instagram:', error, errorReason);
      return new Response(
        JSON.stringify({ error: 'Authentication failed', details: error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!code || !state) {
      console.error('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify state and get user information
    const { data: stateData, error: stateError } = await supabase
      .from('instagram_oauth_states')
      .select('user_id, redirect_path')
      .eq('state', state)
      .eq('used', false)
      .single();

    if (stateError || !stateData) {
      console.error('Invalid or expired state:', stateError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Exchange code for access token
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    const redirectUri = `${supabaseUrl}/functions/v1/instagram-auth-callback`;

    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: appId!,
        client_secret: appSecret!,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Received token data:', { 
      hasAccessToken: !!tokenData.access_token,
      hasUserId: !!tokenData.user_id 
    });

    // Get user profile information
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${tokenData.access_token}`
    );

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      console.error('Profile fetch failed:', error);
      throw new Error(`Failed to fetch Instagram profile: ${error}`);
    }

    const profileData = await profileResponse.json();
    console.log('Profile data fetched:', { 
      username: profileData.username,
      accountType: profileData.account_type
    });

    // Update profile in database
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_id: profileData.id,
        instagram_username: profileData.username,
        instagram_access_token: tokenData.access_token,
        instagram_account_type: profileData.account_type,
        instagram_connected: true,
        instagram_token_expires_at: new Date(Date.now() + 5184000000).toISOString(), // 60 days
        updated_at: new Date().toISOString(),
      })
      .eq('id', stateData.user_id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Failed to update profile');
    }

    // Mark state as used
    await supabase
      .from('instagram_oauth_states')
      .update({ used: true })
      .eq('state', state);

    // Redirect back to the application
    const redirectUrl = new URL(stateData.redirect_path, Deno.env.get('PUBLIC_URL'));
    redirectUrl.searchParams.set('success', 'true');

    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl.toString(),
      },
    });

  } catch (error) {
    console.error('Error in Instagram auth callback:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});