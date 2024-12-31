import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from './response.ts';
import { createSuccessHtml, createErrorHtml } from './response.ts';
import { exchangeCodeForToken, getInstagramProfile } from './instagram-api.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0'

serve(async (req) => {
  console.log('Instagram auth callback function called with URL:', req.url);

  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams; // Simplified parsing

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorReason = searchParams.get('error_reason');
    const errorDescription = searchParams.get('error_description');

    console.log('URL Parameters:', {
      code: code ? `${code.substring(0, 10)}...` : 'missing',
      state,
      error,
      errorReason,
      errorDescription,
      rawUrl: url.toString(),
    });

    // ... rest of the code remains the same

  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
});
