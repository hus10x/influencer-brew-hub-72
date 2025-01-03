import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CollaborationFormData } from "../types";

interface UseCollaborationMutationProps {
  initialData?: CollaborationFormData & { id: string };
  businessId?: string;
  onSuccess?: () => void;
  setIsLoading: (loading: boolean) => void;
}

export const useCollaborationMutation = ({
  initialData,
  businessId,
  onSuccess,
  setIsLoading,
}: UseCollaborationMutationProps) => {
  return useMutation({
    mutationFn: async (data: CollaborationFormData) => {
      setIsLoading(true);
      let imageUrl: string | undefined;

      try {
        if (data.image && data.image.length > 0) {
          const fileExt = data.image[0].name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('business-logos')
            .upload(filePath, data.image[0]);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('business-logos')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        if (!businessId) {
          throw new Error("No business ID available");
        }

        const collaborationData = {
          title: data.title,
          description: data.description,
          requirements: data.requirements.filter(req => req.trim() !== ""),
          compensation: data.compensation,
          deadline: data.deadline,
          max_spots: data.max_spots,
          campaign_id: data.campaign_id,
          business_id: businessId,
          ...(imageUrl && { image_url: imageUrl }),
        };

        if (initialData) {
          const { error } = await supabase
            .from("collaborations")
            .update(collaborationData)
            .eq("id", initialData.id);

          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("collaborations")
            .insert(collaborationData);

          if (error) throw error;
        }

        return data;
      } catch (error) {
        console.error("Error in collaboration mutation:", error);
        throw error;
      }
    },
    onSuccess,
    onError: (error) => {
      console.error("Error with collaboration:", error);
      toast.error(initialData ? "Failed to update collaboration" : "Failed to create collaboration");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });
};