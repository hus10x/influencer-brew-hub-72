import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { CampaignCard } from "./CampaignCard";

interface Campaign {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  collaborationsCount: number;
  status: "draft" | "active" | "completed";
}

interface KanbanBoardProps {
  campaigns: Campaign[];
  onDragEnd: (result: any) => void;
}

export const KanbanBoard = ({ campaigns, onDragEnd }: KanbanBoardProps) => {
  const columns = {
    draft: campaigns.filter((c) => c.status === "draft"),
    active: campaigns.filter((c) => c.status === "active"),
    completed: campaigns.filter((c) => c.status === "completed"),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      {Object.entries(columns).map(([status, items]) => (
        <div key={status} className="space-y-4">
          <h3 className="font-semibold capitalize text-lg">{status}</h3>
          <div className="space-y-4">
            {items.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                title={campaign.title}
                description={campaign.description}
                startDate={campaign.startDate}
                endDate={campaign.endDate}
                collaborationsCount={campaign.collaborationsCount}
                onAddCollaboration={() => {
                  // TODO: Implement add collaboration
                  console.log("Add collaboration to campaign:", campaign.id);
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};