import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/components/dashboard/campaign-form/types";
import { CollaborationFormData } from "@/components/dashboard/collaboration-form/types";

export const createCampaignWithCollaboration = async (
  campaignData: CampaignFormData,
  collaborationData: CollaborationFormData,
  status: 'draft' | 'active' = 'active'
) => {
  const { data, error } = await supabase.functions.invoke('create-campaign-with-collaboration', {
    body: {
      campaignData: {
        ...campaignData,
        status
      },
      collaborationData
    }
  });

  if (error) throw error;
  return data;
};