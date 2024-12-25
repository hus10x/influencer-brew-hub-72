import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'
import { createSuccessHtml, createErrorHtml } from './response.ts'
import { exchangeCodeForToken, getInstagramProfile } from './instagram-api.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

serve(async (req) => {
  // Add CORS headers to all responses
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Instagram auth callback function called');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const error_reason = url.searchParams.get('error_reason');
    
    console.log('URL Parameters:', { 
      hasCode: !!code, 
      state, 
      error,
      error_reason,
      fullUrl: req.url 
    });
    
    if (error) {
      console.error('Instagram OAuth error:', error, 'Reason:', error_reason);
      return createErrorHtml(`Instagram OAuth error: ${error}. Reason: ${error_reason}`);
    }

    if (!code || !state) {
      console.error('Missing required parameters:', { code: !!code, state: !!state });
      return createErrorHtml('Invalid OAuth parameters');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const appId = '1314871332853944';
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    const redirectUri = 'https://preview--influencer-brew-hub-72.lovable.app/';

    if (!appSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables:', {
        hasAppSecret: !!appSecret,
        hasSupabaseUrl: !!supabaseUrl,
        hasServiceRoleKey: !!supabaseServiceRoleKey
      });
      return createErrorHtml('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Fetching OAuth state from database...');
    // Get the user ID from the stored state and ensure it's not already used
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
      .update({ 
        used: true,
        updated_at: new Date().toISOString()
      })
      .eq('state', state);

    if (updateStateError) {
      console.error('Error marking OAuth state as used:', updateStateError);
      return createErrorHtml('Failed to process authentication');
    }

    console.log('Successfully marked OAuth state as used');

    console.log('Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);
    console.log('Token exchange response:', {
      hasAccessToken: !!tokenData.access_token,
      tokenType: tokenData.token_type,
      error: tokenData.error,
      errorDescription: tokenData.error_description
    });
    
    if (!tokenData.access_token) {
      console.error('Failed to get access token:', tokenData);
      return createErrorHtml(`Failed to get access token: ${tokenData.error_description || 'Unknown error'}`);
    }
    
    console.log('Fetching Instagram profile...');
    const profile = await getInstagramProfile(tokenData.access_token);
    console.log('Instagram profile fetched:', {
      username: profile.username,
      hasProfile: !!profile,
      profileData: profile
    });

    // Get user's role from profiles table
    console.log('Fetching user profile...');
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return createErrorHtml('Error fetching user profile');
    }

    console.log('Updating user profile with Instagram data...');
    // Update the user's profile with Instagram info
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
    
    // Determine redirect path based on user type
    const redirectPath = userProfile.user_type === 'influencer' ? '/influencer' : '/client';
    console.log(`Redirecting user to ${redirectPath}`);
    
    return createSuccessHtml({ username: profile.username }, redirectPath);

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
})