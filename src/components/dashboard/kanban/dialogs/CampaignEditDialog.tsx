import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CampaignForm } from "../../CampaignForm";
import { Campaign } from "../types";

interface CampaignEditDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign;
}

export const CampaignEditDialog = ({
  isOpen,
  onOpenChange,
  campaign,
}: CampaignEditDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <CampaignForm
          campaign={campaign}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};