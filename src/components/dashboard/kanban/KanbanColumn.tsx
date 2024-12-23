import { Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import { Campaign } from "./types";

interface KanbanColumnProps {
  status: string;
  campaigns: Campaign[];
  selectedCampaigns: string[];
  onSelect: (campaignId: string) => void;
  selectionMode: boolean;
}

export const KanbanColumn = ({
  status,
  campaigns,
  selectedCampaigns,
  onSelect,
  selectionMode,
}: KanbanColumnProps) => {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex flex-col h-full overflow-hidden rounded-lg ${
            snapshot.isDraggingOver ? "bg-muted/50" : "bg-muted/30"
          }`}
        >
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold capitalize text-lg">{status}</h3>
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
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description || ""}
                  startDate={new Date(campaign.start_date)}
                  endDate={new Date(campaign.end_date)}
                  collaborationsCount={0}
                  isSelected={selectedCampaigns.includes(campaign.id)}
                  onSelect={() => onSelect(campaign.id)}
                  index={index}
                  selectionMode={selectionMode}
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