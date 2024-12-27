import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from './response.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const appId = Deno.env.get('FACEBOOK_APP_ID');
    console.log('Retrieved Facebook App ID:', appId); // Add logging
    
    if (!appId) {
      console.error('Facebook App ID not configured');
      throw new Error('Facebook App ID not configured');
    }

    return new Response(
      JSON.stringify({ 
        appId
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
    console.error('Error in config function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
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