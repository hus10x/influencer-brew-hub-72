import { useState } from "react";
import { DragDropContext, Draggable } from "@hello-pangea/dnd";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban/KanbanColumn";
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
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
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

  const updateCampaignStatus = useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string;
      status: string;
    }) => {
      const { error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", campaignId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaign status updated");
    },
    onError: (error) => {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    },
  });

  const deleteCampaigns = useMutation({
    mutationFn: async (campaignIds: string[]) => {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .in("id", campaignIds);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      toast.success("Campaigns deleted successfully");
      setSelectedCampaigns([]);
    },
    onError: (error) => {
      console.error("Error deleting campaigns:", error);
      toast.error("Failed to delete campaigns");
    },
  });

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    updateCampaignStatus.mutate({
      campaignId: draggableId,
      status: newStatus,
    });
  };

  const toggleCampaignSelection = (campaignId: string) => {
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

  return (
    <div className="flex flex-col h-full gap-4">
      {selectedCampaigns.length > 0 && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              className="self-end flex items-center gap-2"
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
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
          {Object.entries(columns).map(([status, items]) => (
            <div key={status} className="h-full">
              <KanbanColumn
                status={status}
                campaigns={items}
                selectedCampaigns={selectedCampaigns}
                onSelect={toggleCampaignSelection}
              />
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};