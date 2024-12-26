import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'
import { createSuccessHtml, createErrorHtml } from './response.ts'
import { exchangeCodeForToken, getInstagramProfile } from './instagram-api.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Instagram auth callback function called');
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    if (error) {
      console.error('Instagram OAuth error:', error);
      return createErrorHtml(`Instagram OAuth error: ${error}`);
    }

    if (!code || !state) {
      console.error('Missing code or state');
      return createErrorHtml('Invalid OAuth parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');

    if (!appSecret || !supabaseUrl || !supabaseServiceRoleKey || !appId) {
      console.error('Missing required environment variables');
      return createErrorHtml('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Fetching OAuth state from database...');
    const { data: oauthState, error: stateError } = await supabase
      .from('instagram_oauth_states')
      .select('user_id, used, redirect_path')
      .eq('state', state)
      .single();

    if (stateError || !oauthState) {
      console.error('Invalid or expired OAuth state:', stateError);
      return createErrorHtml('Invalid or expired OAuth state');
    }

    if (oauthState.used) {
      console.error('OAuth state has already been used');
      return createErrorHtml('This authentication link has already been used');
    }

    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback`;

    console.log('Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);
    
    console.log('Fetching Instagram profile...');
    const profile = await getInstagramProfile(tokenData.access_token);

    // Mark the state as used
    await supabase
      .from('instagram_oauth_states')
      .update({ used: true })
      .eq('state', state);

    console.log('Updating profile with Instagram data:', profile.username);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_id: profile.id,
        instagram_username: profile.username,
        instagram_connected: true,
        instagram_access_token: tokenData.access_token,
        instagram_account_type: profile.account_type,
        instagram_token_expires_at: new Date(Date.now() + tokenData.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', oauthState.user_id);

    if (updateError) {
      console.error('Database update error:', updateError);
      return createErrorHtml(`Failed to update profile: ${updateError.message}`);
    }

    console.log('Successfully connected Instagram account');
    return createSuccessHtml(
      { username: profile.username }, 
      oauthState.redirect_path || '/influencer'
    );

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
})