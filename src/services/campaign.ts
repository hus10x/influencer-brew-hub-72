import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/components/dashboard/campaign-form/types";
import { CollaborationFormData } from "@/components/dashboard/collaboration-form/types";

export const createCampaignWithCollaboration = async (
  campaignData: CampaignFormData,
  collaborationData?: CollaborationFormData,
  status: 'draft' | 'active' = 'active'
) => {
  console.log('Creating campaign with status:', status);
  console.log('Collaboration data:', collaborationData);

  try {
    const { data, error } = await supabase.functions.invoke('create-campaign-with-collaboration', {
      body: {
        campaignData: {
          ...campaignData,
          status
        },
        collaborationData: collaborationData || null
      }
    });

    if (error) {
      console.error('Error in createCampaignWithCollaboration:', error);
      throw error;
    }

    console.log('Campaign creation successful:', data);
    return data;
  } catch (error) {
    console.error('Error in createCampaignWithCollaboration:', error);
    throw error;
  }
};