import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { CardHeader as CustomCardHeader } from "./card/CardHeader";
import { CardMetrics } from "./card/CardMetrics";
import { CollaborationsList } from "./card/CollaborationsList";

interface KanbanCardProps {
  campaign: Tables<"campaigns">;
  collaborations: Tables<"collaborations">[];
  onEdit: () => void;
  onAddCollaboration: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
}

export const KanbanCard = memo(
  ({
    campaign,
    collaborations,
    onEdit,
    onAddCollaboration,
    isSelected,
    onSelect,
    selectionMode,
  }: KanbanCardProps) => {
    return (
      <Card className="w-full bg-card hover:shadow-md transition-shadow group">
        <CardHeader className="space-y-1 p-4">
          <CustomCardHeader
            title={campaign.title}
            selectionMode={!!selectionMode}
            isSelected={!!isSelected}
            onSelect={() => onSelect?.()}
            onEdit={onEdit}
          />
          <p className="text-sm text-muted-foreground">{campaign.description}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <CardMetrics
            totalSpots={collaborations.reduce((acc, collab) => acc + collab.max_spots, 0)}
            filledSpots={collaborations.reduce((acc, collab) => acc + collab.filled_spots, 0)}
            onAddCollaboration={onAddCollaboration}
          />
          <CollaborationsList
            collaborations={collaborations}
            isExpanded={false}
            onToggle={() => {}}
          />
        </CardContent>
      </Card>
    );
  }
);

KanbanCard.displayName = "KanbanCard";