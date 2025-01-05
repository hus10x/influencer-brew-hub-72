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
      // Get the current filter value from localStorage
      const currentFilter = localStorage.getItem("selectedBusinessId") || "all";
      
      // Cancel outgoing refetches for this query key
      await queryClient.cancelQueries({ 
        queryKey: ["campaigns", currentFilter]
      });

      // Get current campaigns
      const previousCampaigns = queryClient.getQueryData<Campaign[]>(["campaigns", currentFilter]);

      // Optimistically update the cache
      queryClient.setQueryData<Campaign[]>(["campaigns", currentFilter], (old) => {
        if (!old) return [];
        return old.map((campaign) =>
          campaign.id === campaignId
            ? { ...campaign, status }
            : campaign
        );
      });

      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      // Get the current filter value
      const currentFilter = localStorage.getItem("selectedBusinessId") || "all";
      
      console.error("Error updating campaign status:", err);
      toast.error("Failed to update campaign status");
      
      // Revert the optimistic update
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns", currentFilter], context.previousCampaigns);
      }
    },
    onSuccess: () => {
      const currentFilter = localStorage.getItem("selectedBusinessId") || "all";
      queryClient.invalidateQueries({ 
        queryKey: ["campaigns", currentFilter]
      });
      toast.success("Campaign status updated");
    },
  });
};