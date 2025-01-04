import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { collaborationFormSchema, type CollaborationFormData } from "../types";

interface UseCollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  initialData?: CollaborationFormData & { id: string };
}

export const useCollaborationForm = ({ campaignId, onSuccess, initialData }: UseCollaborationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<CollaborationFormData>({
    resolver: zodResolver(collaborationFormSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      requirements: [""],
      compensation: 0,
      deadline: "",
      max_spots: 1,
      campaign_id: campaignId || "",
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
          deadline: data.deadline,
          max_spots: data.max_spots,
          campaign_id: campaignId || data.campaign_id,
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
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
      toast.success(initialData ? "Collaboration updated successfully" : "Collaboration created successfully");
      onSuccess?.();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Failed to save collaboration. Please try again.");
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