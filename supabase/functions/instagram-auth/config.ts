import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    console.log('Config function called, Facebook App ID:', appId ? 'Found' : 'Not found'); 
    
    if (!appId) {
      console.error('Facebook App ID not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Facebook App ID not configured',
          success: false
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const response = {
      appId,
      success: true
    };

    console.log('Sending successful response:', { hasAppId: !!response.appId });

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in config function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
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