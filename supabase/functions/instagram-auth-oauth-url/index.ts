import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting OAuth URL generation...');
    
    const { state } = await req.json();
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-auth-callback`;

    if (!appId) {
      throw new Error('FACEBOOK_APP_ID not configured');
    }

    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'instagram_manage_insights',
      'instagram_manage_messages', // Added for mentions support
      'pages_show_list',
      'pages_read_engagement'
    ].join(',');

    const url = new URL('https://www.facebook.com/v21.0/dialog/oauth');
    url.searchParams.append('client_id', appId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', scopes);
    url.searchParams.append('response_type', 'code');

    console.log('Generated OAuth URL with updated scopes');

    return new Response(
      JSON.stringify({ url: url.toString() }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error generating OAuth URL:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});