import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { KanbanColumn } from "./kanban/KanbanColumn";
import { useState } from "react";
import { Campaign, CampaignStatus } from "./kanban/types";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";

const CAMPAIGN_STATUSES: Record<CampaignStatus, string> = {
  draft: "Draft",
  active: "Active",
  completed: "Completed",
};

export const KanbanBoard = () => {
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const windowWidth = window.innerWidth;

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

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: destination.droppableId })
        .eq('id', draggableId);

      if (error) throw error;

      toast.success('Campaign status updated successfully');
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  return (
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
  );
};