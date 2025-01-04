import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface NoActiveCampaignsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCampaign: () => void;
  onCancel: () => void;
}

export const NoActiveCampaignsDialog = ({
  isOpen,
  onOpenChange,
  onCreateCampaign,
  onCancel,
}: NoActiveCampaignsDialogProps) => {
  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>No Active Campaigns</AlertDialogTitle>
          <AlertDialogDescription>
            You need to create an active campaign before you can create a collaboration.
            Would you like to create a campaign now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onCreateCampaign}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};