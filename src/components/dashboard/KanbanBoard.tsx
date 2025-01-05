import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useState } from "react";
import { Campaign, CampaignStatus } from "./kanban/types";
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

const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

interface KanbanBoardProps {
  campaigns: Campaign[];
}

export const KanbanBoard = ({ campaigns }: KanbanBoardProps) => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const windowWidth = window.innerWidth;
  const updateCampaignStatus = useUpdateCampaignStatus();
  const deleteCampaigns = useDeleteCampaigns(() => {
    setSelectionMode(false);
    setSelectedCampaigns([]);
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
