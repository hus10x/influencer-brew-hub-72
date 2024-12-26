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
    console.log('Instagram auth callback function called with URL:', req.url);
    
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    
    console.log('URL Parameters:', { code: !!code, state, error });
    
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
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth/callback';

    if (!appSecret || !supabaseUrl || !supabaseServiceRoleKey || !appId) {
      console.error('Missing required environment variables');
      return createErrorHtml('Server configuration error');
    }

    console.log('Creating Supabase client...');
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Fetching OAuth state from database...');
    const { data: oauthState, error: stateError } = await supabase
      .from('instagram_oauth_states')
      .select('user_id, used')
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

    console.log('Found valid OAuth state for user:', oauthState.user_id);
    const userId = oauthState.user_id;

    // Mark the state as used immediately to prevent reuse
    const { error: updateStateError } = await supabase
      .from('instagram_oauth_states')
      .update({ used: true })
      .eq('state', state);

    if (updateStateError) {
      console.error('Error marking OAuth state as used:', updateStateError);
      return createErrorHtml('Failed to process authentication');
    }

    console.log('Successfully marked OAuth state as used');

    console.log('Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);
    console.log('Token received:', { hasAccessToken: !!tokenData.access_token });
    
    console.log('Fetching Instagram profile...');
    const profile = await getInstagramProfile(tokenData.access_token);
    console.log('Instagram profile fetched:', {
      username: profile.username,
      hasProfile: !!profile
    });

    console.log('Updating user profile with Instagram data...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_handle: profile.username,
        instagram_connected: true,
        instagram_business_account: true,
        instagram_access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return createErrorHtml(`Failed to update profile: ${updateError.message}`);
    }

    console.log('Successfully connected Instagram account for user:', userId);
    return createSuccessHtml({ username: profile.username }, '/influencer');

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
})