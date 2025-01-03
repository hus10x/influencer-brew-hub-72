import { useState, useEffect } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useDeleteCampaigns } from "@/hooks/use-delete-campaigns";
import { useUpdateCampaignStatus } from "@/hooks/use-update-campaign-status";
import type { Campaign } from "./kanban/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const KanbanBoard = () => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userBusinesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!userBusinesses || userBusinesses.length === 0) return [];

      const businessIds = userBusinesses.map((b) => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
      
      return data as Campaign[];
    },
  });

  const deleteCampaigns = useDeleteCampaigns(() => {
    setSelectedCampaigns([]);
    setSelectionMode(false);
  });

  const updateCampaignStatus = useUpdateCampaignStatus();

  const onDragEnd = (result: any) => {
    if (!result.destination || selectionMode) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    updateCampaignStatus.mutate({
      campaignId: draggableId,
      status: newStatus as Campaign['status'],
    });
  };

  const toggleCampaignSelection = (campaignId: string) => {
    if (!selectionMode) return;
    
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  const columns = {
    draft: campaigns?.filter((c) => c.status === "draft") ?? [],
    active: campaigns?.filter((c) => c.status === "active") ?? [],
    completed: campaigns?.filter((c) => c.status === "completed") ?? [],
  };

  // Convert selectedCampaigns array to a Set before passing to KanbanColumn
  const selectedCampaignsSet = new Set(selectedCampaigns);

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setSelectionMode(!selectionMode);
            if (!selectionMode) {
              setSelectedCampaigns([]);
            }
          }}
          className={`flex items-center gap-2 ${selectionMode ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Check className="w-4 h-4" />
          {selectionMode ? 'Exit Selection' : 'Select Campaigns'}
        </Button>
        
        {selectedCampaigns.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Delete Selected ({selectedCampaigns.length})
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  selected campaigns and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteCampaigns.mutate(selectedCampaigns)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete Campaigns
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-6 h-full min-h-[calc(100vh-12rem)] overflow-hidden">
          {Object.entries(columns).map(([status, items]) => (
            <div key={status} className="h-full min-h-[50vh] flex flex-col">
              <KanbanColumn
                status={status}
                campaigns={items}
                selectedCampaigns={selectedCampaignsSet}
                onSelect={toggleCampaignSelection}
                selectionMode={selectionMode}
                windowWidth={windowWidth}
              />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};