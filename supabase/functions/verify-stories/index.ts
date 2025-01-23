import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 5 * 60 * 1000; // 5 minutes in milliseconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting story verification process');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending verifications that haven't exceeded max retries
    const { data: pendingVerifications, error: fetchError } = await supabase
      .from('story_verifications')
      .select(`
        id,
        story_id,
        story_url,
        verification_status,
        verification_details,
        collaboration_submission_id,
        collaboration_submissions (
          id,
          influencer_id,
          collaboration:collaborations (
            id,
            campaign:campaigns (
              id,
              business:businesses (
                id,
                user_id
              )
            )
          )
        )
      `)
      .eq('verification_status', 'pending')
      .lt('retry_count', MAX_RETRIES)
      .is('verified_at', null);

    if (fetchError) {
      console.error('Error fetching pending verifications:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingVerifications?.length || 0} pending verifications`);

    if (!pendingVerifications?.length) {
      return new Response(
        JSON.stringify({ message: 'No pending verifications to process' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    for (const verification of pendingVerifications) {
      try {
        console.log(`Processing verification ID: ${verification.id}`);

        // Get Instagram access token for the business
        const { data: businessProfile } = await supabase
          .from('profiles')
          .select('instagram_access_token')
          .eq('id', verification.collaboration_submissions.collaboration.campaign.business.user_id)
          .single();

        if (!businessProfile?.instagram_access_token) {
          throw new Error('Business Instagram access token not found');
        }

        // Verify story exists using Instagram Graph API
        const response = await fetch(
          `https://graph.facebook.com/v21.0/${verification.story_id}?fields=id,media_type&access_token=${businessProfile.instagram_access_token}`
        );

        const storyData = await response.json();

        if (response.ok && storyData.id) {
          // Story verified successfully
          await supabase
            .from('story_verifications')
            .update({
              verification_status: 'verified',
              verified_at: new Date().toISOString(),
              verification_details: storyData
            })
            .eq('id', verification.id);

          // Create notification for successful verification
          await supabase
            .from('notifications')
            .insert({
              user_id: verification.collaboration_submissions.influencer_id,
              type: 'story_verified',
              title: 'Story Verified',
              message: 'Your story has been successfully verified!',
              data: { verification_id: verification.id }
            });

        } else {
          // Handle verification failure
          const retryCount = (verification.verification_details?.retry_count || 0) + 1;
          const shouldRetry = retryCount < MAX_RETRIES;

          await supabase
            .from('story_verifications')
            .update({
              verification_status: shouldRetry ? 'pending' : 'failed',
              verification_details: {
                ...verification.verification_details,
                retry_count: retryCount,
                last_error: storyData.error || 'Story not found',
                next_retry: shouldRetry ? new Date(Date.now() + RETRY_DELAY).toISOString() : null
              }
            })
            .eq('id', verification.id);

          if (!shouldRetry) {
            // Create notification for failed verification
            await supabase
              .from('notifications')
              .insert({
                user_id: verification.collaboration_submissions.influencer_id,
                type: 'story_verification_failed',
                title: 'Story Verification Failed',
                message: 'We were unable to verify your story after multiple attempts.',
                data: { verification_id: verification.id }
              });
          }
        }

      } catch (verificationError) {
        console.error(`Error processing verification ${verification.id}:`, verificationError);
        
        // Update verification with error details
        await supabase
          .from('story_verifications')
          .update({
            verification_details: {
              ...verification.verification_details,
              last_error: verificationError.message,
              error_timestamp: new Date().toISOString()
            }
          })
          .eq('id', verification.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Verification process completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in story verification process:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});