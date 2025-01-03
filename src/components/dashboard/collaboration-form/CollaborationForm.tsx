import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import { collaborationFormSchema, type CollaborationFormData } from "./types";
import { CampaignSelector } from "./CampaignSelector";
import { BasicDetailsSection } from "./BasicDetailsSection";
import { RequirementsSection } from "./RequirementsSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { CompensationSection } from "./CompensationSection";
import { FormActions } from "./sections/FormActions";
import { useCollaborationMutation } from "./hooks/useCollaborationMutation";

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

  const mutation = useCollaborationMutation({
    initialData,
    businessId: businessId || userBusiness?.id,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborations"] });
      toast.success(initialData ? "Collaboration updated successfully" : "Collaboration created successfully");
      onSuccess?.();
    },
    setIsLoading,
  });

  const onSubmit = (data: CollaborationFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 dialog-form">
        {isStandalone && !campaignId && campaigns && campaigns.length > 0 && (
          <CampaignSelector form={form} campaigns={campaigns} />
        )}
        <BasicDetailsSection form={form} />
        <RequirementsSection
          form={form}
          requirements={requirements}
          setRequirements={setRequirements}
        />
        <CompensationSection form={form} />
        <ImageUploadSection form={form} />
        <FormActions isLoading={isLoading} initialData={initialData} />
      </form>
    </Form>
  );
};