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
    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      console.log('Received webhook verification request:', { mode, token });

      // Verify the webhook
      if (mode === 'subscribe' && token === Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN')) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        });
      }

      console.error('Webhook verification failed');
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // Handle webhook updates (POST request)
    if (req.method === 'POST') {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const payload = await req.json();
      console.log('Received webhook payload:', payload);

      // Process different types of updates
      for (const entry of payload.entry) {
        const changes = entry.changes;
        for (const change of changes) {
          if (change.field === 'mentions') {
            await handleMention(supabase, change.value);
          } else if (change.field === 'story_insights') {
            await handleStoryInsights(supabase, change.value);
          }
        }
      }

      return new Response(JSON.stringify({ success: true }), {
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

async function handleMention(supabase: any, data: any) {
  console.log('Processing mention:', data);
  // Store mention data for future processing
  const { error } = await supabase
    .from('instagram_mentions')
    .insert({
      media_id: data.media_id,
      comment_id: data.comment_id,
      timestamp: new Date().toISOString(),
      raw_data: data
    });

  if (error) {
    console.error('Error storing mention:', error);
    throw error;
  }
}

async function handleStoryInsights(supabase: any, data: any) {
  console.log('Processing story insights:', data);
  // Update story metrics
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
}