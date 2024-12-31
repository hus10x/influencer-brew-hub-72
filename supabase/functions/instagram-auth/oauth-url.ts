import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting OAuth URL generation...');
    
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header present');
      return new Response(
        JSON.stringify({ error: 'No authorization header present' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    if (!appId) {
      console.error('Facebook App ID not configured');
      throw new Error('Facebook App ID not configured');
    }

    // Generate a random state parameter for security
    const state = crypto.randomUUID();
    console.log('Generated state:', state);
    
    const redirectUri = `https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth`;
    
    console.log('Using redirect URI:', redirectUri);
    console.log('Using app ID:', appId);
    
    // Store the state in the database for verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract user ID from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('Failed to authenticate user');
    }

    // Store the state in the database
    const { error: stateError } = await supabaseClient
      .from('instagram_oauth_states')
      .insert({
        state,
        user_id: user.id,
        redirect_path: '/influencer'
      });

    if (stateError) {
      console.error('Error storing state:', stateError);
      throw new Error('Failed to store OAuth state');
    }

    // Construct URL according to latest Instagram Graph API docs
    const instagramUrl = "https://api.instagram.com/oauth/authorize?" + 
      `client_id=${appId}` +
      "&enable_fb_login=0" +
      "&force_authentication=1" +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      "&response_type=code" +
      "&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish" +
      `&state=${encodeURIComponent(state)}`;

    console.log('Generated Instagram OAuth URL:', instagramUrl);

    return new Response(
      JSON.stringify({ 
        url: instagramUrl,
        state 
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate OAuth URL'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 500,
      },
    )
  }
})