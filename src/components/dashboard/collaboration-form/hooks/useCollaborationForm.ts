import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { collaborationFormSchema, type CollaborationFormData } from "../types";

interface UseCollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  initialData?: CollaborationFormData & { id: string };
}

export const useCollaborationForm = ({ 
  campaignId, 
  onSuccess, 
  onError,
  initialData 
}: UseCollaborationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      requirements: [""],
      compensation: 0,
      deadline: new Date(),
      maxSpots: 1,
      campaignId: campaignId || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CollaborationFormData) => {
      setIsLoading(true);
      let imageUrl: string | undefined;

      try {
        if (data.image && data.image.length > 0) {
          const file = data.image[0];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('business-logos')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('business-logos')
            .getPublicUrl(filePath);

          imageUrl = publicUrl;
        }

        const collaborationData = {
          title: data.title,
          description: data.description,
          requirements: data.requirements.filter(req => req.trim() !== ""),
          compensation: data.compensation,
          deadline: data.deadline.toISOString(),
          max_spots: data.maxSpots,
          campaign_id: campaignId || data.campaignId,
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
    onSuccess: () => {
      // Optimistically update queries
      queryClient.invalidateQueries({ 
        queryKey: ["collaborations"],
        exact: false,
        refetchType: "active"
      });
      
      // Update active campaigns count
      queryClient.invalidateQueries({ 
        queryKey: ["active-campaigns"],
        exact: true
      });
      
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error:", error);
      onError?.(error);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = async (data: CollaborationFormData) => {
    await mutation.mutateAsync(data);
  };

  return {
    form,
    isLoading,
    onSubmit,
  };
};