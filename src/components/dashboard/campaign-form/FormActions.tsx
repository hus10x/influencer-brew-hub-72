import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import type { CampaignFormData } from "./types";
import { Loader2 } from "lucide-react";

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
  const isLoading = mutation.isPending || isCreatingCollaboration;

  return (
    <div className="flex gap-4">
      <Button
        type="submit"
        className="flex-1"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isCreatingCollaboration ? "Creating Campaign & Collaboration..." : "Creating Campaign..."}
          </span>
        ) : (
          campaign ? "Update Campaign" : "Create Campaign & Collaboration"
        )}
      </Button>
      {!campaign && (
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          disabled={isLoading}
          onClick={() => form.handleSubmit((values) => onSubmit(values, 'draft'))()}
        >
          {isLoading ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </span>
          ) : (
            "Save as Draft"
          )}
        </Button>
      )}
    </div>
  );
};