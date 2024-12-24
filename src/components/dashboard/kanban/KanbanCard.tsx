import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";

interface KanbanCardProps {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  collaborationsCount: number;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  selectionMode: boolean;
}

export const KanbanCard = ({
  id,
  title,
  description,
  startDate,
  endDate,
  collaborationsCount,
  isSelected,
  onSelect,
  index,
  selectionMode,
}: KanbanCardProps) => {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <Card 
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`w-full bg-white hover:shadow-md transition-shadow touch-none ${
            isSelected ? 'ring-2 ring-primary' : ''
          } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          style={{
            ...provided.draggableProps.style,
            cursor: snapshot.isDragging ? "grabbing" : "grab",
          }}
        >
          <div className="p-4 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {selectionMode && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect();
                    }}
                  >
                    <Check className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
                  </Button>
                )}
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarDays className="mr-2 h-4 w-4" />
                <span>
                  {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="mr-2 h-4 w-4" />
                <span>{collaborationsCount} collaboration{collaborationsCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </Draggable>
  );
};