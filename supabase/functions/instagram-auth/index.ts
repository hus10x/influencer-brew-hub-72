import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID')
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET')
const REDIRECT_URI = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')
    console.log('Received auth code:', code)

    if (!code) {
      throw new Error('No code provided')
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()
    console.log('Token response:', tokenData)

    if (tokenData.error) {
      throw new Error(`Token error: ${tokenData.error_message || tokenData.error}`)
    }

    // Get long-lived token
    const longLivedTokenResponse = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_APP_SECRET}&access_token=${tokenData.access_token}`
    )
    const longLivedTokenData = await longLivedTokenResponse.json()
    console.log('Long-lived token response:', longLivedTokenData)

    // Get user profile information
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type&access_token=${longLivedTokenData.access_token}`
    )
    const profile = await profileResponse.json()
    console.log('Instagram profile:', profile)

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get the user's session
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      throw new Error('Error getting user: ' + (userError?.message || 'No user found'))
    }

    // Update the user's profile with Instagram information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        instagram_handle: profile.username,
        instagram_connected: true,
        instagram_business_account: profile.account_type === 'BUSINESS',
        instagram_access_token: longLivedTokenData.access_token,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      throw new Error('Error updating profile: ' + updateError.message)
    }

    // Redirect back to the application
    return new Response(
      JSON.stringify({
        success: true,
        profile: {
          instagram_handle: profile.username,
          instagram_connected: true,
          instagram_business_account: profile.account_type === 'BUSINESS',
        },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process Instagram authentication',
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})