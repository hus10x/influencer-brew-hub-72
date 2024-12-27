import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  console.log('Config function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders
    });
  }

  try {
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    console.log('Retrieved Facebook App ID:', appId ? 'Found' : 'Not found');

    if (!appId) {
      console.error('Facebook App ID not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Facebook App ID not configured',
          success: false
        }),
        {
          status: 500,
          headers: corsHeaders
        }
      );
    }

    console.log('Sending successful response with App ID');
    return new Response(
      JSON.stringify({ 
        appId,
        success: true
      }),
      {
        headers: corsHeaders,
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in config function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      {
        headers: corsHeaders,
        status: 500,
      }
    );
  }
})