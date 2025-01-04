import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useState } from "react";
import { Campaign, CampaignStatus } from "./kanban/types";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useUpdateCampaignStatus } from "@/hooks/use-update-campaign-status";
import { useDeleteCampaigns } from "@/hooks/use-delete-campaigns";
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
import { Button } from "@/components/ui/button";
import { Trash2, GripVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

const KanbanSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-13rem)]">
    {Object.entries(CAMPAIGN_STATUSES).map(([status]) => (
      <div 
        key={status}
        className="flex flex-col h-full rounded-lg border border-primary/20 bg-primary/[0.03] dark:bg-primary/5"
      >
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 bg-card border border-primary/10 rounded-lg space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const KanbanBoard = () => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const windowWidth = window.innerWidth;
  const updateCampaignStatus = useUpdateCampaignStatus();
  const deleteCampaigns = useDeleteCampaigns(() => {
    setSelectionMode(false);
    setSelectedCampaigns([]);
  });

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!businesses?.length) return [];

      const businessIds = businesses.map(b => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return (data || []).map(campaign => ({
        ...campaign,
        status: campaign.status as CampaignStatus
      })) as Campaign[];
    },
  });

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as CampaignStatus;
    
    try {
      await updateCampaignStatus.mutateAsync({
        campaignId: draggableId,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating campaign status:', error);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedCampaigns.length === 0) {
      toast.error("No campaigns selected");
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteCampaigns.mutate(selectedCampaigns);
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <KanbanSkeleton />
      </>
    );
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectionMode(!selectionMode);
              if (!selectionMode) {
                setSelectedCampaigns([]);
              }
            }}
          >
            <GripVertical className="mr-2 h-4 w-4" />
            {selectionMode ? "Cancel Selection" : "Select Campaigns"}
          </Button>
          {selectionMode && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteSelected}
              disabled={selectedCampaigns.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Selected ({selectedCampaigns.length})
            </Button>
          )}
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-13rem)]">
          {Object.entries(CAMPAIGN_STATUSES).map(([status, label]) => (
            <KanbanColumn
              key={status}
              status={status as CampaignStatus}
              campaigns={campaigns.filter((campaign) => campaign.status === status)}
              selectedCampaigns={selectedCampaigns}
              onSelect={handleCampaignSelect}
              selectionMode={selectionMode}
              windowWidth={windowWidth}
            />
          ))}
        </div>
      </DragDropContext>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected campaigns
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};