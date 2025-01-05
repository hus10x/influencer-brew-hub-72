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
import { Tables } from "@/integrations/supabase/types";

interface CollaborationFormProps {
  campaignId?: string;
  onSuccess?: () => void;
  isStandalone?: boolean;
  onCollaborationData?: (data: any) => void;
  initialData?: CollaborationFormData & { id: string };
  campaigns?: Tables<"campaigns">[];
}

export const CollaborationForm = forwardRef(({
  campaignId,
  onSuccess,
  isStandalone = true,
  onCollaborationData,
  initialData,
  campaigns,
}: CollaborationFormProps, ref) => {
  const { form, isLoading, onSubmit } = useCollaborationForm({
    campaignId,
    onSuccess,
    initialData,
  });

  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || [""]
  );

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