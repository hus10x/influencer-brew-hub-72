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
    console.log('Facebook auth function called');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      console.error('Facebook OAuth error:', error);
      return createErrorHtml(`Facebook OAuth error: ${error}`);
    }

    if (!code) {
      console.error('No code provided');
      return createErrorHtml('No authorization code provided');
    }

    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const appSecret = Deno.env.get('FACEBOOK_APP_SECRET');
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!appId || !appSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables');
      return createErrorHtml('Server configuration error');
    }

    console.log('Exchanging code for token...');
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);
    console.log('Token received, fetching Instagram profile...');
    const profile = await getInstagramProfile(tokenData.access_token);

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    console.log('Updating profile with Instagram data:', profile.username);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_handle: profile.username,
        instagram_connected: true,
        instagram_business_account: true,
        instagram_access_token: tokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('instagram_handle', profile.username);

    if (updateError) {
      console.error('Database update error:', updateError);
      return createErrorHtml(`Failed to update profile: ${updateError.message}`);
    }

    console.log('Successfully connected Instagram business account');
    return createSuccessHtml({ username: profile.username });

  } catch (error) {
    console.error('Error in Facebook auth:', error);
    return createErrorHtml(error.message || 'Failed to process Facebook authentication');
  }
})