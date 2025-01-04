import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Campaign } from "@/components/dashboard/kanban/types";

export const useDeleteCampaigns = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      try {
        // First, get all collaborations for these campaigns
        const { data: collaborations, error: fetchCollabError } = await supabase
          .from("collaborations")
          .select("id")
          .in("campaign_id", campaignIds);

        if (fetchCollabError) {
          console.error("Error fetching collaborations:", fetchCollabError);
          throw fetchCollabError;
        }

        const collaborationIds = collaborations?.map(c => c.id) || [];

        if (collaborationIds.length > 0) {
          // Get all submissions for these collaborations
          const { data: submissions, error: submissionsError } = await supabase
            .from("collaboration_submissions")
            .select("id")
            .in("collaboration_id", collaborationIds);

          if (submissionsError) {
            console.error("Error fetching submissions:", submissionsError);
            throw submissionsError;
          }

          const submissionIds = submissions?.map(s => s.id) || [];

          if (submissionIds.length > 0) {
            // Delete story verifications first
            const { error: verificationError } = await supabase
              .from("story_verifications")
              .delete()
              .in("collaboration_submission_id", submissionIds);

            if (verificationError) {
              console.error("Error deleting verifications:", verificationError);
              throw verificationError;
            }

            // Delete submissions
            const { error: submissionDeleteError } = await supabase
              .from("collaboration_submissions")
              .delete()
              .in("collaboration_id", collaborationIds);

            if (submissionDeleteError) {
              console.error("Error deleting submissions:", submissionDeleteError);
              throw submissionDeleteError;
            }
          }

          // Delete collaborations
          const { error: collabDeleteError } = await supabase
            .from("collaborations")
            .delete()
            .in("campaign_id", campaignIds);

          if (collabDeleteError) {
            console.error("Error deleting collaborations:", collabDeleteError);
            throw collabDeleteError;
          }
        }

        // Finally delete the campaigns
        const { error: campaignError } = await supabase
          .from("campaigns")
          .delete()
          .in("id", campaignIds);

        if (campaignError) {
          console.error("Error deleting campaigns:", campaignError);
          throw campaignError;
        }

        return campaignIds;
      } catch (error) {
        console.error("Error in deletion process:", error);
        throw error;
      }
    },
    onMutate: async (campaignIds) => {
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);
      
      queryClient.setQueryData<Campaign[]>(["campaigns"], (old) => 
        old?.filter(campaign => !campaignIds.includes(campaign.id)) ?? []
      );
      
      return { previousCampaigns };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaigns deleted successfully");
      onSuccess?.();
    },
    onError: (error, _, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
      console.error("Error deleting campaigns:", error);
      toast.error("Failed to delete campaigns. Please try again.");
    },
  });
};