import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { CampaignCard } from "./CampaignCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: userBusinesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!userBusinesses) return [];

      const businessIds = userBusinesses.map((b) => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds);

      if (error) throw error;
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const columns = {
    draft: campaigns?.filter((c) => c.status === "draft") ?? [],
    active: campaigns?.filter((c) => c.status === "active") ?? [],
    completed: campaigns?.filter((c) => c.status === "completed") ?? [],
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
        {Object.entries(columns).map(([status, items]) => (
          <Droppable key={status} droppableId={status}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                <h3 className="font-semibold capitalize text-lg">{status}</h3>
                <div className="space-y-4 min-h-[200px]">
                  {items.map((campaign, index) => (
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
                  ))}
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