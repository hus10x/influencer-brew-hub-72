import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { corsHeaders } from '../_shared/cors.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface StoryVerification {
  id: string;
  collaboration_submission_id: string;
  story_id: string;
  verification_status: string;
  verification_details: any;
}

async function verifyStory(storyId: string, accessToken: string) {
  try {
    const response = await fetch(
      `https://graph.instagram.com/${storyId}?fields=id,media_type,media_url,timestamp&access_token=${accessToken}`
    );

    if (!response.ok) {
      throw new Error(`Instagram API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      verified: true,
      details: data
    };
  } catch (error) {
    console.error('Error verifying story:', error);
    return {
      verified: false,
      error: error.message
    };
  }
}

async function processVerification(verification: StoryVerification, supabase: any) {
  try {
    // Get the influencer's Instagram access token
    const { data: submission } = await supabase
      .from('collaboration_submissions')
      .select(`
        influencer_id,
        collaboration:collaborations (
          campaign:campaigns (
            business:businesses (
              user_id
            )
          )
        )
      `)
      .eq('id', verification.collaboration_submission_id)
      .single();

    if (!submission) {
      throw new Error('Submission not found');
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('instagram_access_token')
      .eq('id', submission.influencer_id)
      .single();

    if (!profile?.instagram_access_token) {
      throw new Error('Instagram access token not found');
    }

    // Verify the story
    const verificationResult = await verifyStory(
      verification.story_id,
      profile.instagram_access_token
    );

    // Update verification status
    const { error: updateError } = await supabase
      .from('story_verifications')
      .update({
        verification_status: verificationResult.verified ? 'verified' : 'failed',
        verification_details: verificationResult,
        verified_at: verificationResult.verified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.id);

    if (updateError) throw updateError;

    // If verified, update the collaboration submission
    if (verificationResult.verified) {
      const { error: submissionError } = await supabase
        .from('collaboration_submissions')
        .update({
          verified: true,
          verification_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', verification.collaboration_submission_id);

      if (submissionError) throw submissionError;

      // Create notification for business owner
      await supabase
        .from('notifications')
        .insert({
          user_id: submission.collaboration.campaign.business.user_id,
          type: 'story_verified',
          title: 'Story Verified',
          message: 'An influencer story has been verified successfully',
          data: {
            verification_id: verification.id,
            submission_id: verification.collaboration_submission_id
          }
        });
    }

    return verificationResult;
  } catch (error) {
    console.error('Error processing verification:', error);
    return { error: error.message };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get pending verifications
    const { data: pendingVerifications, error: fetchError } = await supabase
      .from('story_verifications')
      .select('*')
      .eq('verification_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10);

    if (fetchError) throw fetchError;

    // Process each verification
    const results = await Promise.all(
      pendingVerifications.map(verification => 
        processVerification(verification, supabase)
      )
    );

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});