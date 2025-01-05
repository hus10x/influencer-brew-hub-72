import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useState, useEffect } from "react";
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

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for campaigns...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        async (payload) => {
          console.log('Campaign change detected:', payload);
          
          // Handle different types of changes
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New campaign created');
              break;
            case 'DELETE':
              toast.info('Campaign deleted');
              break;
            case 'UPDATE':
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              
              if (oldStatus !== newStatus) {
                toast.info(`Campaign status updated to ${newStatus}`);
              }
              break;
          }
          
          // Refetch campaigns to update the UI
          await refetch();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to campaign changes');
        }
        
        if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to campaign changes');
          toast.error('Error connecting to real-time updates');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up campaign subscription...');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

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
    return <div>Loading...</div>;
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
