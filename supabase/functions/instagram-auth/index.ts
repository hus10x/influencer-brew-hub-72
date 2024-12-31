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
    // ... (rest of the code before obtaining userAccessToken)

    // Extract user access token from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return createErrorHtml('Missing or invalid Authorization header');
    }
    const userAccessToken = authHeader.substring('Bearer '.length);

    // Create Supabase client with user access token
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        token: userAccessToken,
      },
    });

    // Access user session
    const { data: { session }, error: sessionError } = await supabase.auth.session();

    if (sessionError) {
      return createErrorHtml(`Error fetching user session: ${sessionError.message}`);
    }

    // ... (rest of the code) 
  } catch (error) {
    console.error('Error in Instagram auth:', error);
    return createErrorHtml(error.message || 'Failed to process Instagram authentication');
  }
});
