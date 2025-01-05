import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CampaignFormData } from "../types";
import { createCampaignWithCollaboration } from "@/services/campaign";

interface UseCampaignMutationProps {
  onSuccess: () => void;
  setCollaborationData: (data: any) => void;
  setIsProcessingCollaboration: (value: boolean) => void;
}

export const useCampaignMutation = ({
  onSuccess,
  setCollaborationData,
  setIsProcessingCollaboration,
}: UseCampaignMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CampaignFormData & { collaborationData?: any }) => {
      try {
        const status = values.collaborationData ? 'active' : (values.status || 'active');
        
        if (values.collaborationData) {
          return await createCampaignWithCollaboration({ ...values, status }, values.collaborationData);
        }

        const { data, error } = await supabase
          .from("campaigns")
          .insert({
            title: values.title,
            description: values.description,
            business_id: values.business_id,
            start_date: values.start_date,
            end_date: values.end_date,
            status,
          })
          .select()
          .single();

        if (error) {
          if (error.message?.includes("Collaboration can only be created for active campaigns")) {
            throw new Error("Campaign must be active to add collaborations");
          }
          throw error;
        }
        return data;
      } catch (error) {
        console.error("Error in mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign created successfully");
      setCollaborationData(null);
      setIsProcessingCollaboration(false);
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create campaign. Please try again.");
      setCollaborationData(null);
      setIsProcessingCollaboration(false);
    },
  });
};