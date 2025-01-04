import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { collaborationFormSchema, type CollaborationFormData } from "./types";
import { CampaignSelector } from "./CampaignSelector";
import { BasicDetailsSection } from "./BasicDetailsSection";
import { RequirementsSection } from "./RequirementsSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { CompensationSection } from "./CompensationSection";
import { BusinessSelector } from "./BusinessSelector";

interface CollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  businessId?: string;
  isStandalone?: boolean;
  initialData?: CollaborationFormData & { id: string };
}

export const CollaborationForm = ({
  campaignId,
  onSuccess,
  businessId,
  isStandalone = true,
  initialData,
}: CollaborationFormProps) => {
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [""]
  );
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
      business_id: businessId || "",
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userBusinesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!userBusinesses || userBusinesses.length === 0) return [];

      const businessIds = userBusinesses.map((b) => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: isStandalone && !campaignId,
  });

  // Get the business ID if not provided
  const { data: userBusiness } = useQuery({
    queryKey: ["userBusiness"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("No business found");
      return data;
    },
    enabled: !businessId,
  });

  const uploadImage = async (file: File): Promise<string> => {
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

    return publicUrl;
  };

  const mutation = useMutation({
    mutationFn: async (data: CollaborationFormData) => {
      setIsLoading(true);
      let imageUrl: string | undefined;

      try {
        if (data.image && data.image.length > 0) {
          imageUrl = await uploadImage(data.image[0]);
        }

        const effectiveBusinessId = businessId || data.business_id || userBusiness?.id;
        if (!effectiveBusinessId) {
          throw new Error("No business ID available");
        }

        const collaborationData = {
          title: data.title,
          description: data.description,
          requirements: data.requirements.filter(req => req.trim() !== ""),
          compensation: data.compensation,
          deadline: data.deadline,
          max_spots: data.max_spots,
          campaign_id: campaignId || data.campaign_id,
          business_id: effectiveBusinessId,
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
      console.error("Error with collaboration:", error);
      toast.error(initialData ? "Failed to update collaboration" : "Failed to create collaboration");
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const onSubmit = (data: CollaborationFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isStandalone && !campaignId && campaigns && campaigns.length > 0 && (
          <CampaignSelector form={form} campaigns={campaigns} />
        )}
        {isStandalone && !businessId && (
          <BusinessSelector form={form} isStandalone={isStandalone} />
        )}
        <BasicDetailsSection form={form} />
        <RequirementsSection
          form={form}
          requirements={requirements}
          setRequirements={setRequirements}
        />
        <CompensationSection form={form} />
        <ImageUploadSection form={form} />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading 
            ? (initialData ? "Updating..." : "Creating...") 
            : (initialData ? "Update Collaboration" : "Create Collaboration")
          }
        </Button>
      </form>
    </Form>
  );
};
