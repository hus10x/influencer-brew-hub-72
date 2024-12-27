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

  const appId = Deno.env.get('FACEBOOK_APP_ID');
  
  if (!appId) {
    return new Response(
      JSON.stringify({ error: 'Configuration error', success: false }),
      { headers: corsHeaders, status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ appId, success: true }),
    { headers: corsHeaders, status: 200 }
  );
})