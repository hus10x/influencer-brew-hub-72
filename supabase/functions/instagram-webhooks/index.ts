import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Received webhook verification request:', { mode, token });

      // Verify the mode and token
      if (mode === 'subscribe' && token === Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN')) {
        console.log('Webhook verified successfully');
        return new Response(challenge, {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' },
        });
      }

      console.error('Failed webhook verification:', { mode, token });
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // Handle actual webhook data (POST request)
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Received webhook data:', body);

      // Process the webhook data here
      // This part requires authentication, but the verification endpoint above doesn't

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});