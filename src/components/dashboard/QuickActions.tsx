import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

export const QuickActions = () => {
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false);
  const [showNoCampaignsAlert, setShowNoCampaignsAlert] = useState(false);

  const { data: activeCampaigns, isLoading } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!businesses?.length) return [];

      const businessIds = businesses.map(b => b.id);

      const { data: campaigns, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds)
        .eq("status", "active");

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return campaigns || [];
    },
  });

  const handleNewCollaborationClick = () => {
    if (!isLoading && (!activeCampaigns?.length)) {
      setShowNoCampaignsAlert(true);
    } else {
      setIsCollaborationDialogOpen(true);
    }
  };

  const handleAlertClose = (shouldOpenCampaign = false) => {
    setShowNoCampaignsAlert(false);
    if (shouldOpenCampaign) {
      setIsCampaignDialogOpen(true);
    }
  };

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
              onClick={handleNewCollaborationClick}
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

        <AlertDialog open={showNoCampaignsAlert} onOpenChange={setShowNoCampaignsAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>No Active Campaigns</AlertDialogTitle>
              <AlertDialogDescription>
                You need to create a campaign before you can create a collaboration. Would you like to create a campaign now?
              </DialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => handleAlertClose(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAlertClose(true)}>
                Create Campaign
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};