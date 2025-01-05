import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignForm } from "./CampaignForm";
import { CollaborationForm } from "./collaboration-form/CollaborationForm";
import { Skeleton } from "@/components/ui/skeleton";
import type { Campaign } from "./kanban/types";

const FormSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-12 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-8 w-2/3" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  </div>
);

interface QuickActionsProps {
  campaigns: Campaign[];
}

export const QuickActions = ({ campaigns = [] }: QuickActionsProps) => {
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false);
  const [showNoCampaignsAlert, setShowNoCampaignsAlert] = useState(false);
  const queryClient = useQueryClient();

  const handleNewCollaborationClick = () => {
    console.log("Active campaigns:", campaigns);
    if (!campaigns || campaigns.length === 0) {
      setShowNoCampaignsAlert(true);
    } else {
      setIsCollaborationDialogOpen(true);
    }
  };

  const handleCampaignSuccess = () => {
    setIsCampaignDialogOpen(false);
    // Invalidate and refetch campaigns immediately
    queryClient.invalidateQueries({ queryKey: ["campaigns"] });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <h2 className="text-2xl font-semibold tracking-tight">Quick Actions</h2>
      <div className="flex items-center flex-wrap gap-4">
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <Button size="lg" onClick={() => setIsCampaignDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign to manage your collaborations
              </DialogDescription>
            </DialogHeader>
            <FormSkeleton />
            <CampaignForm onSuccess={handleCampaignSuccess} />
          </DialogContent>
        </Dialog>

        <Dialog open={isCollaborationDialogOpen} onOpenChange={setIsCollaborationDialogOpen}>
          <Button 
            variant="secondary" 
            size="lg"
            onClick={handleNewCollaborationClick}
          >
            <Users className="w-4 h-4" />
            New Collaboration
          </Button>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Collaboration</DialogTitle>
              <DialogDescription>
                Create a new collaboration opportunity for influencers
              </DialogDescription>
            </DialogHeader>
            <FormSkeleton />
            <CollaborationForm 
              onSuccess={() => setIsCollaborationDialogOpen(false)} 
              isStandalone={true}
              campaigns={campaigns}
            />
          </DialogContent>
        </Dialog>

        <AlertDialog open={showNoCampaignsAlert} onOpenChange={setShowNoCampaignsAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No Active Campaigns</AlertDialogTitle>
              <AlertDialogDescription>
                You need to create a campaign before you can create a collaboration. Would you like to create a campaign now?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowNoCampaignsAlert(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowNoCampaignsAlert(false);
                  setIsCampaignDialogOpen(true);
                }}
              >
                Create Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};
