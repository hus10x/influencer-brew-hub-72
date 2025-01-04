import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { CampaignForm } from "./CampaignForm";
import { CollaborationForm } from "./collaboration-form/CollaborationForm";
import { toast } from "sonner";

const FormSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-10 w-1/2" />
  </div>
);

export const QuickActions = () => {
  const [isCollaborationDialogOpen, setIsCollaborationDialogOpen] = useState(false);
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: activeCampaigns, isLoading, error } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) {
          console.log("No authenticated user found");
          throw new Error("Not authenticated");
        }

        const { data: businesses, error: businessError } = await supabase
          .from("businesses")
          .select("id")
          .eq("user_id", userData.user.id);

        if (businessError) {
          console.error("Error fetching businesses:", businessError);
          throw businessError;
        }

        if (!businesses?.length) {
          console.log("No businesses found for user:", userData.user.id);
          return [];
        }

        const businessIds = businesses.map(b => b.id);
        console.log("Business IDs:", businessIds);

        const { data: campaigns, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .in("business_id", businessIds)
          .eq("status", "active");

        if (campaignError) {
          console.error("Error fetching campaigns:", campaignError);
          throw campaignError;
        }
        
        console.log("Active campaigns:", campaigns);
        return campaigns || [];
      } catch (error) {
        console.error("Error in query:", error);
        toast.error("Failed to fetch campaigns");
        throw error;
      }
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 30,
  });

  const handleNewCollaborationClick = () => {
    if (!activeCampaigns?.length) {
      toast.error("You need to create an active campaign before you can create a collaboration.");
      return;
    }
    setIsCollaborationDialogOpen(true);
  };

  const handleCollaborationSuccess = () => {
    setIsCollaborationDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["collaborations"] });
  };

  const handleCampaignSuccess = () => {
    setIsCampaignDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["active-campaigns"] });
  };

  if (error) {
    console.error("Query error:", error);
    toast.error("Failed to load campaigns. Please try again.");
  }

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="flex flex-col sm:flex-row gap-4">
        <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
              <DialogDescription>
                Create a new campaign to start collaborating with influencers.
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
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleNewCollaborationClick}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Collaboration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Collaboration</DialogTitle>
              <DialogDescription>
                Create a new collaboration opportunity for your campaign.
              </DialogDescription>
            </DialogHeader>
            {isLoading ? (
              <FormSkeleton />
            ) : (
              <CollaborationForm
                onSuccess={handleCollaborationSuccess}
                isStandalone={true}
                campaigns={activeCampaigns || []}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};