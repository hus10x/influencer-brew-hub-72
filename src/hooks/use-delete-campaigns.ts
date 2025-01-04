import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteCampaigns = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignIds: string[]) => {
      // First, delete all collaborations associated with these campaigns
      const { error: collaborationsError } = await supabase
        .from("collaborations")
        .delete()
        .in("campaign_id", campaignIds);

      if (collaborationsError) {
        console.error("Error deleting collaborations:", collaborationsError);
        throw collaborationsError;
      }

      // Then delete the campaigns
      const { error: campaignsError } = await supabase
        .from("campaigns")
        .delete()
        .in("id", campaignIds);

      if (campaignsError) {
        console.error("Error deleting campaigns:", campaignsError);
        throw campaignsError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaigns deleted successfully");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error deleting campaigns:", error);
      toast.error("Failed to delete campaigns. Please try again.");
    },
  });
};