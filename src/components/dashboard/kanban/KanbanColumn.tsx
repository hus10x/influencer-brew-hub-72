import { Droppable } from "@hello-pangea/dnd";
import { KanbanCard } from "./KanbanCard";
import type { Campaign } from "./types";

interface KanbanColumnProps {
  status: string;
  campaigns: Campaign[];
  selectedCampaigns?: Set<string>;
  onSelect?: (id: string) => void;
  selectionMode?: boolean;
  windowWidth?: number;
}

export const KanbanColumn = ({
  status,
  campaigns,
  selectedCampaigns = new Set(),
  onSelect,
  selectionMode = false,
  windowWidth = 0,
}: KanbanColumnProps) => {
  return (
    <Droppable droppableId={status}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`flex flex-col h-full rounded-lg ${
            snapshot.isDraggingOver ? "bg-card/50" : "bg-card/30"
          }`}
          style={{
            minHeight: windowWidth < 768 ? '50vh' : '100%',
          }}
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold capitalize text-lg text-card-foreground">{status}</h3>
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
                campaign && (
                  <KanbanCard
                    key={campaign.id}
                    campaign={campaign}
                    isSelected={selectedCampaigns?.has(campaign.id)}
                    onSelect={() => onSelect?.(campaign.id)}
                    selectionMode={selectionMode}
                  />
                )
              ))
            )}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};