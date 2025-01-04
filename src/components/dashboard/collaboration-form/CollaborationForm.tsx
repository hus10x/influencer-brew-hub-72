import { forwardRef, useImperativeHandle, useState } from "react";
import { Form } from "@/components/ui/form";
import { type CollaborationFormData } from "./types";
import { CampaignSelector } from "./CampaignSelector";
import { BasicDetailsSection } from "./BasicDetailsSection";
import { RequirementsSection } from "./RequirementsSection";
import { ImageUploadSection } from "./ImageUploadSection";
import { CompensationSection } from "./CompensationSection";
import { FormHeader } from "./sections/FormHeader";
import { FormActions } from "./sections/FormActions";
import { useCollaborationForm } from "./hooks/useCollaborationForm";
import { NoActiveCampaignsDialog } from "./components/NoActiveCampaignsDialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  initialData,
}: CollaborationFormProps, ref) => {
  const { form, isLoading, onSubmit } = useCollaborationForm({
    campaignId,
    onSuccess,
    initialData,
  });

  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [""]
  );

  const [showNoCampaignsDialog, setShowNoCampaignsDialog] = useState(false);

  // Fetch active campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("status", "active");
      
      if (error) throw error;
      return data;
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: async () => {
      return new Promise<void>((resolve, reject) => {
        form.handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            resolve();
          } catch (error) {
            reject(error);
          }
        })();
      });
    }
  }));

  // Show dialog if standalone and no active campaigns
  if (isStandalone && campaigns.length === 0) {
    return (
      <NoActiveCampaignsDialog
        isOpen={true}
        onOpenChange={setShowNoCampaignsDialog}
        onCreateCampaign={() => {
          // Handle campaign creation dialog
          if (onSuccess) onSuccess();
        }}
        onCancel={() => {
          if (onSuccess) onSuccess();
        }}
      />
    );
  }

  return (
    <>
      {initialData && <FormHeader isEditing />}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isStandalone && <CampaignSelector form={form} campaigns={campaigns} />}
          <BasicDetailsSection form={form} />
          <RequirementsSection 
            form={form} 
            requirements={requirements}
            setRequirements={setRequirements}
          />
          <CompensationSection form={form} />
          <ImageUploadSection form={form} />
          <FormActions 
            isLoading={isLoading}
            isEditing={!!initialData}
            isStandalone={isStandalone}
          />
        </form>
      </Form>
    </>
  );
});

CollaborationForm.displayName = "CollaborationForm";