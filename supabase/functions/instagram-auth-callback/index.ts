import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
      console.error('Error from Facebook:', error, errorReason);
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

    // Get Facebook access token
    const tokenResponse = await fetch('https://graph.facebook.com/v21.0/oauth/access_token', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: appId,
        client_secret: appSecret,
        redirect_uri: redirectUri,
        code: code,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      throw new Error(`Failed to exchange code for token: ${error}`);
    }

    const tokenData = await tokenResponse.json();
    const fbAccessToken = tokenData.access_token;

    // Get user's Facebook Pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?access_token=${fbAccessToken}`
    );

    if (!pagesResponse.ok) {
      throw new Error('Failed to fetch Facebook Pages');
    }

    const pagesData = await pagesResponse.json();
    const page = pagesData.data[0]; // Get first page for now

    if (!page) {
      throw new Error('No Facebook Pages found');
    }

    // Get Instagram Business Account connected to the Page
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
    );

    if (!igAccountResponse.ok) {
      throw new Error('Failed to fetch Instagram Business Account');
    }

    const igAccountData = await igAccountResponse.json();
    const igBusinessAccount = igAccountData.instagram_business_account;

    if (!igBusinessAccount) {
      throw new Error('No Instagram Business Account found');
    }

    // Update profile with Facebook and Instagram information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        facebook_user_id: tokenData.user_id,
        facebook_page_id: page.id,
        facebook_page_access_token: page.access_token,
        facebook_page_name: page.name,
        instagram_id: igBusinessAccount.id,
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