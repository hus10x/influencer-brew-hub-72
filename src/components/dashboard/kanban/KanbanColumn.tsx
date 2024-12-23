import { Droppable } from "@hello-pangea/dnd";
import { Campaign } from "./types";
import { KanbanCard } from "./KanbanCard";

interface KanbanColumnProps {
  title: string;
  campaigns: Campaign[];
  droppableId: string;
  selectedCampaigns: string[];
  onSelect: (id: string) => void;
}

export const KanbanColumn = ({
  title,
  campaigns,
  droppableId,
  selectedCampaigns,
  onSelect,
}: KanbanColumnProps) => {
  return (
    <Droppable droppableId={droppableId}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex flex-col h-full overflow-hidden rounded-lg ${
            snapshot.isDraggingOver ? "bg-muted/50" : "bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold capitalize text-lg">{title}</h3>
            <span className="text-sm text-muted-foreground">
              {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {campaigns.length === 0 ? (
              <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Drop campaigns here</p>
              </div>
            ) : (
              campaigns.map((campaign, index) => (
                <KanbanCard
                  key={campaign.id}
                  campaign={campaign}
                  index={index}
                  isSelected={selectedCampaigns.includes(campaign.id)}
                  onSelect={() => onSelect(campaign.id)}
                />
              ))
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};