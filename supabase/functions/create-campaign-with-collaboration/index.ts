import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { campaignData, collaborationData } = await req.json()

    const { data: { user } } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    )

    if (!user) {
      throw new Error('Not authenticated')
    }

    console.log('Starting transaction for campaign creation with status:', campaignData.status)

    // Start a transaction
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .insert({
        title: campaignData.title,
        description: campaignData.description,
        business_id: campaignData.business_id,
        start_date: campaignData.start_date,
        end_date: campaignData.end_date,
        status: campaignData.status || 'active',
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      throw campaignError
    }

    console.log('Campaign created successfully:', campaign.id)

    // Only create collaboration if data is provided
    let collaboration = null
    if (collaborationData) {
      console.log('Creating collaboration for campaign:', campaign.id)
      const { data: newCollaboration, error: collaborationError } = await supabaseClient
        .from('collaborations')
        .insert({
          title: collaborationData.title,
          description: collaborationData.description,
          requirements: collaborationData.requirements,
          compensation: collaborationData.compensation,
          deadline: collaborationData.deadline,
          max_spots: collaborationData.max_spots,
          campaign_id: campaign.id,
          status: 'open',
        })
        .select()
        .single()

      if (collaborationError) {
        console.error('Collaboration creation error:', collaborationError)
        // If collaboration fails, we should ideally rollback but we'll handle this in a future update
        throw collaborationError
      }

      collaboration = newCollaboration
      console.log('Collaboration created successfully:', collaboration.id)
    }

    return new Response(
      JSON.stringify({ campaign, collaboration }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-campaign-with-collaboration:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})