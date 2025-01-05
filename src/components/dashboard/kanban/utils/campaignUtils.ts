import { Campaign } from "../types";
import { Tables } from "@/integrations/supabase/types";

export const filterCollaborationsByStatus = (
  campaign: Campaign & { collaborations: Tables<"collaborations">[] }
) => {
  if (campaign.status === "completed") {
    return campaign.collaborations.filter(
      (collab) => collab.status === "completed"
    );
  }
  return campaign.collaborations;
};

export const shouldShowCollaboration = (
  campaignStatus: string,
  collaborationStatus: string
) => {
  if (campaignStatus === "completed") {
    return collaborationStatus === "completed";
  }
  return true;
};