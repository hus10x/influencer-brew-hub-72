import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'
import { createSuccessHtml, createErrorHtml } from './response.ts'
import { exchangeCodeForToken, getLongLivedToken, getInstagramProfile } from './instagram-api.ts'
import { updateUserInstagramProfile } from './database.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Instagram auth function called');
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const error_reason = url.searchParams.get('error_reason');
    
    console.log('Received params:', { code, error, error_reason });

    if (error) {
      console.error('Instagram OAuth error:', { error, error_reason });
      return createErrorHtml(`Instagram OAuth error: ${error_reason || error}`);
    }

    if (!code) {
      console.error('No code provided');
      return createErrorHtml('No authorization code provided');
    }

    // Get environment variables
    const appId = Deno.env.get('INSTAGRAM_APP_ID');
    const appSecret = Deno.env.get('INSTAGRAM_APP_SECRET');
    const redirectUri = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth';
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!appId || !appSecret || !supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing required environment variables');
      return createErrorHtml('Server configuration error');
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code, appId, appSecret, redirectUri);
    
    // Get long-lived token
    const longLivedToken = await getLongLivedToken(tokenData.access_token, appSecret);
    
    // Get user profile
    const profile = await getInstagramProfile(longLivedToken);

    // Update user profile in database
    await updateUserInstagramProfile(supabaseUrl, supabaseServiceRoleKey, {
      username: profile.username,
      isBusinessAccount: profile.account_type === 'BUSINESS',
      accessToken: longLivedToken,
    });

    console.log('Successfully connected Instagram account');
    return createSuccessHtml({ username: profile.username });

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
})