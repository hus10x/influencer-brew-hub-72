import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID')
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET')
const REDIRECT_URI = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Instagram auth function called');
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    const error_reason = url.searchParams.get('error_reason')
    
    console.log('Received params:', { code, error, error_reason });

    if (error) {
      console.error('Instagram OAuth error:', { error, error_reason });
      throw new Error(`Instagram OAuth error: ${error_reason || error}`);
    }

    if (!code) {
      console.error('No code provided');
      throw new Error('No code provided');
    }

    // Exchange code for access token
    console.log('Exchanging code for access token...');
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData);

    if (tokenData.error) {
      console.error('Token error:', tokenData);
      throw new Error(`Token error: ${tokenData.error_message || tokenData.error}`);
    }

    // Get long-lived token
    console.log('Getting long-lived token...');
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`
    )
    const longLivedTokenData = await longLivedTokenResponse.json()
    console.log('Long-lived token response:', longLivedTokenData);

    // Get user profile information
    console.log('Getting user profile...');
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${longLivedTokenData.access_token}`
    )
    const profile = await profileResponse.json()
    console.log('Instagram profile:', profile);

    // Initialize Supabase client
    console.log('Initializing Supabase client...');
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the user's session
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error('No authorization header');
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Error getting user: ' + (userError?.message || 'No user found'));
    }

    // Update the user's profile with Instagram information
    console.log('Updating user profile...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_handle: profile.username,
        instagram_connected: true,
        instagram_business_account: profile.account_type === 'BUSINESS',
        instagram_access_token: longLivedTokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError);
      throw new Error('Error updating profile: ' + updateError.message);
    }

    console.log('Successfully connected Instagram account');
    
    // Redirect back to the application with success
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          instagram_handle: profile.username,
          instagram_connected: true,
          instagram_business_account: profile.account_type === 'BUSINESS',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process Instagram authentication',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})