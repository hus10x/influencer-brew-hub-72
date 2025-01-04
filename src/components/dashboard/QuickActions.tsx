import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CampaignForm } from "./CampaignForm";
import { CollaborationForm } from "./collaboration-form/CollaborationForm";

export const QuickActions = () => {
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false);

  return (
    <div className="space-y-4 animate-fade-up">
      <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
      <div className="flex items-center flex-wrap gap-4">
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign to manage your collaborations
              </DialogDescription>
            </DialogHeader>
            <CampaignForm onSuccess={() => setIsCampaignDialogOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={isCollaborationDialogOpen} onOpenChange={setIsCollaborationDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="lg"
            >
              <Users className="w-4 h-4" />
              New Collaboration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Collaboration</DialogTitle>
              <DialogDescription>
                Create a new collaboration opportunity for influencers
              </DialogDescription>
            </DialogHeader>
            <CollaborationForm 
              onSuccess={() => setIsCollaborationDialogOpen(false)} 
              isStandalone={true}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};