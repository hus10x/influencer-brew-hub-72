import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Campaign } from "@/components/dashboard/kanban/types";

export const useDeleteCampaigns = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      // First, get all collaboration IDs for these campaigns
      const { data: collaborations, error: fetchError } = await supabase
        .from("collaborations")
        .select("id")
        .in("campaign_id", campaignIds);

      if (fetchError) {
        console.error("Error fetching collaborations:", fetchError);
        throw fetchError;
      }

      const collaborationIds = collaborations?.map(c => c.id) || [];

      if (collaborationIds.length > 0) {
        // First get all submission IDs
        const { data: submissions, error: submissionsQueryError } = await supabase
          .from("collaboration_submissions")
          .select("id")
          .in("collaboration_id", collaborationIds);

        if (submissionsQueryError) {
          console.error("Error fetching submissions:", submissionsQueryError);
          throw submissionsQueryError;
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

          // Delete collaboration submissions
          const { error: submissionsError } = await supabase
            .from("collaboration_submissions")
            .delete()
            .in("collaboration_id", collaborationIds);

          if (submissionsError) {
            console.error("Error deleting submissions:", submissionsError);
            throw submissionsError;
          }
        }

        // Delete collaborations
        const { error: collaborationsError } = await supabase
          .from("collaborations")
          .delete()
          .in("campaign_id", campaignIds);

        if (collaborationsError) {
          console.error("Error deleting collaborations:", collaborationsError);
          throw collaborationsError;
        }
      }

      // Finally delete the campaigns
      const { error: campaignsError } = await supabase
        .from("campaigns")
        .delete()
        .in("id", campaignIds);

      if (campaignsError) {
        console.error("Error deleting campaigns:", campaignsError);
        throw campaignsError;
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