import { memo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Campaign } from "./types";
import { CardHeader as CustomCardHeader } from "./card/CardHeader";

interface KanbanCardProps {
  campaign: Campaign;
  isSelected?: boolean;
  onSelect?: () => void;
  selectionMode?: boolean;
}

export const KanbanCard = memo(
  ({
    campaign,
    isSelected = false,
    onSelect,
    selectionMode = false,
  }: KanbanCardProps) => {
    if (!campaign) return null;

    return (
      <Card className="w-full bg-card hover:shadow-md transition-shadow group">
        <CardHeader className="space-y-1 p-4">
          <CustomCardHeader
            title={campaign.title}
            selectionMode={selectionMode}
            isSelected={isSelected}
            onSelect={onSelect}
          />
          <p className="text-sm text-muted-foreground">{campaign.description}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-sm text-muted-foreground">
            <p>Start: {new Date(campaign.start_date).toLocaleDateString()}</p>
            <p>End: {new Date(campaign.end_date).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>
    );
  }
);

KanbanCard.displayName = "KanbanCard";