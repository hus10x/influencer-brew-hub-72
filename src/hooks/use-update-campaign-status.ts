import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Campaign } from "@/components/dashboard/kanban/types";

export const useUpdateCampaignStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string;
      status: Campaign['status'];
    }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", campaignId);
      if (error) throw error;
    },
    onMutate: async ({ campaignId, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["campaigns"] });

      // Snapshot the previous value
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Campaign[]>(["campaigns"], (old) => {
        if (!old) return [];
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status }
            : campaign
        );
      });

      // Return a context object with the snapshotted value
      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      console.error("Error updating campaign status:", err);
      toast.error("Failed to update campaign status");
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSuccess: () => {
      toast.success("Campaign status updated");
    },
  });
};