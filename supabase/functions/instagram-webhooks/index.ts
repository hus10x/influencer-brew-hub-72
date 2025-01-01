import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

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
    console.log('Received webhook request:', { method: req.method, url: req.url });

    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Processing webhook verification:', { mode, token, challenge });

      const verifyToken = Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN');
      if (!verifyToken) {
        console.error('Missing INSTAGRAM_WEBHOOK_VERIFY_TOKEN');
        return new Response('Configuration error', { 
          status: 500, 
          headers: corsHeaders 
        });
      }

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verification successful');
        return new Response(challenge, {
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
        });
      }

      console.error('Webhook verification failed');
      return new Response('Forbidden', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    // Handle webhook data (POST request)
    if (req.method === 'POST') {
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Missing Supabase configuration');
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Get and log the webhook payload
      const payload = await req.json();
      console.log('Received webhook payload:', JSON.stringify(payload));

      // Process the webhook data
      for (const entry of payload.entry || []) {
        for (const change of entry.changes || []) {
          console.log('Processing change:', change);
          
          if (change.field === 'story_insights') {
            await handleStoryInsights(supabase, change.value);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleStoryInsights(supabase: any, data: any) {
  console.log('Processing story insights:', data);
  
  try {
    const { error } = await supabase
      .from('story_verifications')
      .update({
        verification_details: {
          ...data,
          processed_at: new Date().toISOString()
        }
      })
      .eq('story_id', data.media_id);

    if (error) {
      console.error('Error updating story insights:', error);
      throw error;
    }
    
    console.log('Successfully updated story insights');
  } catch (error) {
    console.error('Failed to process story insights:', error);
    throw error;
  }
}