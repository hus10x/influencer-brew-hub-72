import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
      <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle>Edit Campaign</DialogTitle>
          <DialogDescription>Update campaign details</DialogDescription>
        </DialogHeader>
        <CampaignForm
          onSuccess={() => onOpenChange(false)}
          campaign={{
            id: campaign.id,
            title: campaign.title,
            description: campaign.description || "",
            start_date: new Date(campaign.start_date).toISOString(),
            end_date: new Date(campaign.end_date).toISOString(),
            business_id: campaign.business_id,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};