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
import { BusinessFilter } from "./BusinessFilter";

const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

export const KanbanBoard = () => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const windowWidth = window.innerWidth;
  const updateCampaignStatus = useUpdateCampaignStatus();
  const deleteCampaigns = useDeleteCampaigns(() => {
    setSelectionMode(false);
    setSelectedCampaigns([]);
  });

  // Initialize selectedBusinessId from localStorage
  useEffect(() => {
    const savedFilter = localStorage.getItem("selectedBusinessId");
    setSelectedBusinessId(savedFilter === "all" ? null : savedFilter);
    setIsInitialized(true);
  }, []);

  // Reset selection mode and selected campaigns when changing business filter
  useEffect(() => {
    if (isInitialized) {
      setSelectionMode(false);
      setSelectedCampaigns([]);
    }
  }, [selectedBusinessId, isInitialized]);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns", selectedBusinessId || "all"],
    queryFn: async () => {
      console.log('Fetching campaigns...');
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // First, get all businesses for the user
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (businessError) {
        console.error("Error fetching businesses:", businessError);
        throw businessError;
      }

      if (!businesses?.length) {
        console.log('No businesses found for user');
        return [];
      }

      // Build the campaigns query
      let query = supabase.from("campaigns").select("*");
      
      if (selectedBusinessId) {
        // If a specific business is selected, filter for it
        query = query.eq('business_id', selectedBusinessId);
      } else {
        // Otherwise, get campaigns for all user's businesses
        const businessIds = businesses.map(b => b.id);
        query = query.in('business_id', businessIds);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      console.log("Fetched campaigns:", data);
      return (data || []).map(campaign => ({
        ...campaign,
        status: campaign.status as CampaignStatus
      })) as Campaign[];
    },
    enabled: isInitialized, // Only run query after initialization
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
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <BusinessFilter 
          selectedBusinessId={selectedBusinessId}
          onBusinessSelect={(id) => {
            const businessId = id === "all" ? null : id;
            localStorage.setItem("selectedBusinessId", id || "all");
            setSelectedBusinessId(businessId);
          }}
        />
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
