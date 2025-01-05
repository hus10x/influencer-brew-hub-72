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
    console.log('Received campaign data:', campaignData)
    console.log('Received collaboration data:', collaborationData)

    // Start a transaction
    const { data: campaign, error: campaignError } = await supabaseClient
      .from('campaigns')
      .insert({
        ...campaignData,
        status: collaborationData ? 'active' : 'draft'
      })
      .select()
      .single()

    if (campaignError) {
      console.error('Campaign creation error:', campaignError)
      throw campaignError
    }

    console.log('Campaign created successfully:', campaign)

    let collaboration = null
    if (collaborationData && campaign) {
      const { data: newCollaboration, error: collaborationError } = await supabaseClient
        .from('collaborations')
        .insert({
          ...collaborationData,
          campaign_id: campaign.id,
          status: 'open'
        })
        .select()
        .single()

      if (collaborationError) {
        console.error('Collaboration creation error:', collaborationError)
        // Rollback campaign creation
        await supabaseClient
          .from('campaigns')
          .delete()
          .eq('id', campaign.id)
        throw collaborationError
      }

      collaboration = newCollaboration
      console.log('Collaboration created successfully:', collaboration)
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