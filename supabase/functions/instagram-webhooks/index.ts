import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const createNotification = async (supabase: any, userId: string, type: string, title: string, message: string, data?: any) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([
        {
          user_id: userId,
          type,
          title,
          message,
          data,
          read: false
        }
      ]);

    if (error) throw error;
    console.log(`Created notification for user ${userId} of type ${type}`);
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Instagram webhook received:', new Date().toISOString());
    
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle subscription verification
    if (req.method === 'GET') {
      console.log('Verification request received:', { mode, token });
      
      const verifyToken = Deno.env.get('INSTAGRAM_WEBHOOK_VERIFY_TOKEN');
      
      if (!verifyToken) {
        console.error('INSTAGRAM_WEBHOOK_VERIFY_TOKEN not set');
        throw new Error('Webhook verify token not configured');
      }

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully');
        return new Response(challenge, { 
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        });
      }

      console.error('Webhook verification failed:', { mode, token });
      return new Response('Forbidden', { status: 403, headers: corsHeaders });
    }

    // Handle webhook updates
    if (req.method === 'POST') {
      const body = await req.json();
      console.log('Webhook update received:', JSON.stringify(body, null, 2));

      // Process different types of updates
      const updates = body.entry?.[0]?.changes || [];
      for (const update of updates) {
        console.log('Processing update:', {
          field: update.field,
          value: update.value
        });

        // Find the associated user based on the Instagram ID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('instagram_id', body.entry[0].id)
          .single();

        if (profileError) {
          console.error('Error finding user profile:', profileError);
          continue;
        }

        switch (update.field) {
          case 'mentions':
            console.log('Mention received:', update.value);
            await createNotification(
              supabase,
              profile.id,
              'mention',
              'New Instagram Mention',
              'Your account was mentioned in a post',
              update.value
            );
            break;
          case 'comments':
            console.log('Comment received:', update.value);
            await createNotification(
              supabase,
              profile.id,
              'comment',
              'New Instagram Comment',
              'Someone commented on your post',
              update.value
            );
            break;
          case 'story_insights':
            console.log('Story insights received:', update.value);
            await createNotification(
              supabase,
              profile.id,
              'story_insights',
              'Story Performance Update',
              'Your story metrics have been updated',
              update.value
            );
            break;
          default:
            console.log('Unknown update type:', update.field);
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