import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: corsHeaders, status: 405 }
    );
  }

  const appId = Deno.env.get('FACEBOOK_APP_ID');
  console.log('FACEBOOK_APP_ID present:', !!appId);

  if (!appId) {
    console.error('FACEBOOK_APP_ID not found in environment');
    return new Response(
      JSON.stringify({ error: 'FACEBOOK_APP_ID not configured' }),
      { headers: corsHeaders, status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ appId }),
    { headers: corsHeaders, status: 200 }
  );
})