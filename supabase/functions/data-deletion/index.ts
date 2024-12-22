import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Parse the request body
    const body = await req.json()
    console.log('Received data deletion request:', body)

    // Verify the request is coming from Facebook
    // In production, you should verify the signed_request parameter
    // For now, we'll just check if user_id is provided
    if (!body.user_id) {
      throw new Error('user_id is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Call the database function to delete user data
    const { error } = await supabaseClient.rpc('handle_user_deletion', {
      user_id: body.user_id
    })

    if (error) {
      console.error('Error deleting user data:', error)
      throw error
    }

    // Return confirmation URL as required by Facebook
    return new Response(
      JSON.stringify({
        url: `https://${req.headers.get('host')}/confirmation?id=${body.user_id}`,
        confirmation_code: body.user_id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})