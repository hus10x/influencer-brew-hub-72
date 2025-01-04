import { supabase } from "@/integrations/supabase/client";
import { CampaignFormData } from "@/components/dashboard/campaign-form/types";
import { CollaborationFormData } from "@/components/dashboard/collaboration-form/types";

export const createCampaignWithCollaboration = async (
  campaignData: CampaignFormData,
  collaborationData: CollaborationFormData
) => {
  const { data, error } = await supabase.functions.invoke('create-campaign-with-collaboration', {
    body: {
      campaignData,
      collaborationData
    }
  });

  if (error) throw error;
  return data;
};