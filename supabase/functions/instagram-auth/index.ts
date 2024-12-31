import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './response.ts';
import { createSuccessHtml, createErrorHtml } from './response.ts';
import { exchangeCodeForToken, getInstagramProfile } from './instagram-api.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

serve(async (req) => {
  // Handle CORS 
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Instagram auth function called with URL:', req.url);
    const url = new URL(req.url);
    // Remove any fragments from the URL
    const cleanUrl = url.toString().split('#')[0];
    const searchParams = new URLSearchParams(new URL(cleanUrl).search);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const userId = searchParams.get('userId'); // Extract user ID from query parameters

    if (!userId) {
      return createErrorHtml('Missing user ID in request');
    }

    // ... (rest of the code for handling error, state validation, code exchange, etc.)

    // ... (rest of the code to fetch Instagram profile)

    // Update user profile with Instagram data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_username: profile.username,
        instagram_connected: true,
        instagram_account_type: 'BUSINESS', 
        instagram_access_token: tokenData.access_token, 
        instagram_token_expires_at: new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId); 

    // ... (rest of the code for error handling and response)

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
});
