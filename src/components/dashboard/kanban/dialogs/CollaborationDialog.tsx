import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollaborationForm } from "../../collaboration-form/CollaborationForm";

interface CollaborationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  businessId: string;
}

export const CollaborationDialog = ({
  isOpen,
  onOpenChange,
  campaignId,
  businessId,
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
          businessId={businessId}
          onSuccess={() => onOpenChange(false)}
          isStandalone={false}
        />
      </DialogContent>
    </Dialog>
  );
};