import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

export const QuickActions = () => {
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false);
  const [showNoCampaignsAlert, setShowNoCampaignsAlert] = useState(false);
  const queryClient = useQueryClient();

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
    console.log("Active campaigns:", activeCampaigns);
    if (!activeCampaigns || activeCampaigns.length === 0) {
      setShowNoCampaignsAlert(true);
    } else {
      setIsCollaborationDialogOpen(true);
    }
  };

  const handleCampaignSuccess = () => {
    setIsCampaignDialogOpen(false);
    // Invalidate and refetch active campaigns
    queryClient.invalidateQueries({ queryKey: ["active-campaigns"] });
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
            {isLoading ? (
              <FormSkeleton />
            ) : (
              <CampaignForm onSuccess={handleCampaignSuccess} />
            )}
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
            {isLoading ? (
              <FormSkeleton />
            ) : (
              <CollaborationForm 
                onSuccess={() => setIsCollaborationDialogOpen(false)} 
                isStandalone={true}
              />
            )}
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