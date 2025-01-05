import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollaborationForm } from "../../collaboration-form/CollaborationForm";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { useRef } from "react";

interface CollaborationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaigns?: Tables<"campaigns">[];
}

export const CollaborationDialog = ({
  isOpen,
  onOpenChange,
  campaignId,
  campaigns,
}: CollaborationDialogProps) => {
  const formRef = useRef<{ submitForm: () => Promise<void> }>(null);

  const handleSubmit = async () => {
    try {
      await formRef.current?.submitForm();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>Create New Collaboration</DialogTitle>
          <DialogDescription>
            Add a new collaboration opportunity for this campaign
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <CollaborationForm
            ref={formRef}
            campaignId={campaignId}
            onSuccess={() => onOpenChange(false)}
            isStandalone={false}
            campaigns={campaigns}
          />
          <Button 
            onClick={handleSubmit}
            className="w-full"
          >
            Create Collaboration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};