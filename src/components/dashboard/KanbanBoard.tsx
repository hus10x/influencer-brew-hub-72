import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { CampaignCard } from "./CampaignCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Campaign {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: "draft" | "active" | "completed";
  business_id: string;
}

export const KanbanBoard = () => {
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      // First get the businesses owned by the user
      const { data: userBusinesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!userBusinesses || userBusinesses.length === 0) return [];

      const businessIds = userBusinesses.map((b) => b.id);

      // Then get campaigns for those businesses
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

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const newStatus = destination.droppableId;

    updateCampaignStatus.mutate({
      campaignId: draggableId,
      status: newStatus,
    });
  };

  if (error) {
    toast.error("Failed to load campaigns");
    return <div>Error loading campaigns</div>;
  }

  if (isLoading) {
    return <div>Loading campaigns...</div>;
  }

  const columns = {
    draft: campaigns?.filter((c) => c.status === "draft") ?? [],
    active: campaigns?.filter((c) => c.status === "active") ?? [],
    completed: campaigns?.filter((c) => c.status === "completed") ?? [],
  };

  if (!campaigns?.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4 text-center">
        <h3 className="text-xl font-semibold">No campaigns yet</h3>
        <p className="text-muted-foreground max-w-md">
          Create your first campaign to start managing your collaborations
        </p>
        <Button className="mt-4">
          <Plus className="w-4 h-4 mr-2" />
          New Campaign
        </Button>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {Object.entries(columns).map(([status, items]) => (
          <Droppable key={status} droppableId={status}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`space-y-4 p-4 rounded-lg ${
                  snapshot.isDraggingOver ? "bg-muted/50" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold capitalize text-lg">{status}</h3>
                  <span className="text-sm text-muted-foreground">
                    {items.length} campaign{items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="space-y-4 min-h-[200px]">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] border-2 border-dashed border-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Drop campaigns here
                      </p>
                    </div>
                  ) : (
                    items.map((campaign, index) => (
                      <Draggable
                        key={campaign.id}
                        draggableId={campaign.id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <CampaignCard
                              title={campaign.title}
                              description={campaign.description}
                              startDate={new Date(campaign.start_date)}
                              endDate={new Date(campaign.end_date)}
                              collaborationsCount={0}
                              onAddCollaboration={() => {
                                // TODO: Implement add collaboration
                                console.log(
                                  "Add collaboration to campaign:",
                                  campaign.id
                                );
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
};