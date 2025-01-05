import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollaborationForm } from "../../collaboration-form/CollaborationForm";
import { Tables } from "@/integrations/supabase/types";

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
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>Create New Collaboration</DialogTitle>
          <DialogDescription>
            Add a new collaboration opportunity for this campaign
          </DialogDescription>
        </DialogHeader>
        <CollaborationForm
          campaignId={campaignId}
          onSuccess={() => onOpenChange(false)}
          isStandalone={false}
          campaigns={campaigns}
        />
      </DialogContent>
    </Dialog>
  );
};