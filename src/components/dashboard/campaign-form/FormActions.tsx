import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import type { CampaignFormData } from "./types";

interface FormActionsProps {
  form: UseFormReturn<CampaignFormData>;
  mutation: {
    isPending: boolean;
  };
  isCreatingCollaboration: boolean;
  campaign?: {
    id: string;
  };
  onSubmit: (values: CampaignFormData, status?: 'draft' | 'active') => void;
}

export const FormActions = ({
  form,
  mutation,
  isCreatingCollaboration,
  campaign,
  onSubmit,
}: FormActionsProps) => {
  return (
    <div className="flex gap-4">
      <Button
        type="submit"
        className="flex-1"
        disabled={mutation.isPending || isCreatingCollaboration}
      >
        {mutation.isPending || isCreatingCollaboration ? "Creating..." : (campaign ? "Update Campaign" : "Create Campaign & Collaboration")}
      </Button>
      {!campaign && (
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={mutation.isPending || isCreatingCollaboration}
          onClick={() => form.handleSubmit((values) => onSubmit(values, 'draft'))()}
        >
          Save as Draft
        </Button>
      )}
    </div>
  );
};