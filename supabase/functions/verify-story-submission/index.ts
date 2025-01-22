import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface StoryVerification {
  id: string
  story_url: string
  verification_status: string
  verification_details: any
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get story verification data
    const { data: verifications, error: fetchError } = await supabaseClient
      .from('story_verifications')
      .select('*')
      .eq('verification_status', 'pending')
      .limit(10)

    if (fetchError) throw fetchError

    // Process each verification
    for (const verification of verifications) {
      try {
        // Here we'll add the actual Instagram API verification logic later
        // For now, we'll simulate the verification process
        const isValid = true // This will be replaced with actual verification logic
        
        const verificationResult = {
          verification_status: isValid ? 'verified' : 'failed',
          verification_details: {
            checked_at: new Date().toISOString(),
            is_valid: isValid,
          },
        }

        // Update verification status
        const { error: updateError } = await supabaseClient
          .from('story_verifications')
          .update(verificationResult)
          .eq('id', verification.id)

        if (updateError) throw updateError

        // Update related collaboration submission
        const { error: submissionError } = await supabaseClient
          .from('collaboration_submissions')
          .update({
            verified: isValid,
            verification_date: new Date().toISOString(),
            status: isValid ? 'verified' : 'rejected'
          })
          .eq('id', verification.collaboration_submission_id)

        if (submissionError) throw submissionError

      } catch (error) {
        console.error(`Error processing verification ${verification.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ message: 'Verification process completed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})