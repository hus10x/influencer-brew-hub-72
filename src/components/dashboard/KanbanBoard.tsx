import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useState } from "react";
import { Campaign, CampaignStatus } from "./kanban/types";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
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
import { RealtimeHandler } from "./kanban/components/RealtimeHandler";
import { filterCollaborationsByStatus } from "./kanban/utils/campaignUtils";
import { toast } from "@/hooks/use-toast";

const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

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

  const { data: campaigns = [], isLoading, refetch } = useQuery({
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
        .select(`
          *,
          collaborations (
            id,
            title,
            description,
            status,
            filled_spots,
            max_spots,
            campaign_id,
            compensation,
            created_at,
            deadline,
            image_url,
            requirements,
            updated_at
          )
        `)
        .in("business_id", businessIds);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return (data || []).map(campaign => ({
        ...campaign,
        status: campaign.status as CampaignStatus,
        collaborations: filterCollaborationsByStatus({
          ...campaign,
          collaborations: campaign.collaborations || []
        })
      }));
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
      toast({
        title: "Error",
        description: "No campaigns selected",
        variant: "destructive"
      });
      return;
    }
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    deleteCampaigns.mutate(selectedCampaigns);
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <RealtimeHandler 
        onCampaignUpdate={refetch}
        onCollaborationUpdate={refetch}
      />

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