import { Draggable } from "@hello-pangea/dnd";
import { CalendarDays, Users, Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Campaign } from "./types";

interface KanbanCardProps {
  campaign: Campaign;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const KanbanCard = ({ campaign, index, isSelected, onSelect }: KanbanCardProps) => {
  return (
    <Draggable draggableId={campaign.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <Card className={`w-full bg-card hover:shadow-md transition-shadow group ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onSelect();
                    }}
                  >
                    {isSelected ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </Button>
                  <CardTitle className="text-xl">{campaign.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{campaign.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="mr-2 h-4 w-4" />
                  <span>0 collaborations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </Draggable>
  );
};