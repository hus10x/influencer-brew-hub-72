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
      console.log('Updating campaign status:', { campaignId, status });
      const { data, error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) {
        console.error('Error in updateCampaignStatus:', error);
        throw error;
      }

      return data;
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
      toast.error("Failed to update campaign status. Please try again.");
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
    },
    onSuccess: (data) => {
      toast.success(`Campaign status updated to ${data.status}`);
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};