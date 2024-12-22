import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INSTAGRAM_APP_ID = Deno.env.get('INSTAGRAM_APP_ID')
const INSTAGRAM_APP_SECRET = Deno.env.get('INSTAGRAM_APP_SECRET')
const REDIRECT_URI = 'https://ahtozhqhjdkivyaqskko.supabase.co/functions/v1/instagram-auth'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const code = url.searchParams.get('code')

    // If no code, redirect to Instagram authorization
    if (!code) {
      const instagramUrl = `https://api.instagram.com/oauth/authorize?client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&scope=user_profile,user_media&response_type=code`
      return new Response(JSON.stringify({ url: instagramUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
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

    const data = await tokenResponse.json()
    console.log('Instagram OAuth response:', data)

    // Get user profile information
    const profileResponse = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`
    )
    const profile = await profileResponse.json()
    console.log('Instagram profile:', profile)

    return new Response(
      JSON.stringify({
        access_token: data.access_token,
        user_id: data.user_id,
        username: profile.username,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process Instagram authentication' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})