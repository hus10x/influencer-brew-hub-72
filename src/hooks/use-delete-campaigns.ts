import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Campaign } from "@/components/dashboard/kanban/types";

export const useDeleteCampaigns = (
  onSuccess?: () => void
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .in("id", campaignIds);
      if (error) throw error;
      return campaignIds;
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
      toast.success("Campaigns deleted successfully");
      onSuccess?.();
    },
    onError: (error, _, context) => {
      if (context?.previousCampaigns) {
        queryClient.setQueryData(["campaigns"], context.previousCampaigns);
      }
      console.error("Error deleting campaigns:", error);
      toast.error("Failed to delete campaigns");
    }
  });
};