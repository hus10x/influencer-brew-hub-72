import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
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
import { NoActiveCampaignsDialog } from "./components/NoActiveCampaignsDialog";
import { LoadingState } from "./components/LoadingState";

interface CollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  isStandalone?: boolean;
  onCollaborationData?: (data: any) => void;
  initialData?: CollaborationFormData & { id: string };
}

export const CollaborationForm = forwardRef(({
  campaignId,
  onSuccess,
  isStandalone = true,
  onCollaborationData,
  initialData,
}: CollaborationFormProps, ref) => {
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [""]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showNoCampaignsDialog, setShowNoCampaignsDialog] = useState(false);
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

  const { data: userData } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data;
    },
  });

  const userId = userData?.user?.id;

  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ["campaigns", userId],
    queryFn: async () => {
      if (!userId) throw new Error("Not authenticated");

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userId);

      if (!businesses?.length) return [];

      const businessIds = businesses.map(b => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds)
        .eq("status", "active");

      if (error) throw error;
      return data;
    },
    enabled: isStandalone && !!userId,
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      return new Promise<void>((resolve, reject) => {
        form.handleSubmit(async (data) => {
          try {
            await mutation.mutateAsync(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        })();
      });
    }
  }));

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

  useEffect(() => {
    if (isStandalone && !isLoadingCampaigns && !campaigns?.length) {
      setShowNoCampaignsDialog(true);
    }
  }, [isStandalone, isLoadingCampaigns, campaigns?.length]);

  const onSubmit = async (data: CollaborationFormData) => {
    await mutation.mutateAsync(data);
  };

  if (isLoadingCampaigns) {
    return <LoadingState />;
  }

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isStandalone && campaigns?.length > 0 && (
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

          {isStandalone && (
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading 
                ? (initialData ? "Updating..." : "Creating...") 
                : (initialData ? "Update Collaboration" : "Create Collaboration")
              }
            </Button>
          )}
        </form>
      </Form>

      <NoActiveCampaignsDialog
        isOpen={showNoCampaignsDialog}
        onOpenChange={setShowNoCampaignsDialog}
        onCreateCampaign={() => {
          setShowNoCampaignsDialog(false);
          window.location.href = "/client/campaigns";
        }}
        onCancel={() => {
          setShowNoCampaignsDialog(false);
          onSuccess?.();
        }}
      />
    </>
  );
});

CollaborationForm.displayName = "CollaborationForm";