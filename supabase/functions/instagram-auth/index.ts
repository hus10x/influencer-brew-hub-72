import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './response.ts';
import { createSuccessHtml, createErrorHtml } from './response.ts';
import { exchangeCodeForToken, getInstagramProfile } from './instagram-api.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

serve(async (req) => {
  // Handle CORS 
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Instagram auth function called with URL:', req.url);
    const url = new URL(req.url);
    // Remove any fragments from the URL
    const cleanUrl = url.toString().split('#')[0];
    const searchParams = new URLSearchParams(new URL(cleanUrl).search);

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const userId = searchParams.get('userId'); 

    // ... (rest of the code, excluding the session access part)

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
});
