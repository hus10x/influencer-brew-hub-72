import { Card } from "@/components/ui/card";
import { Check, ChevronDown, ChevronUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [isExpanded, setIsExpanded] = useState(false);

  // Mocked data for demonstration - will be replaced with real data
  const totalSpots = 15;
  const filledSpots = 8;

  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4 last:mb-0"
          style={{
            ...provided.draggableProps.style,
            transform: provided.draggableProps.style?.transform,
            transition: provided.draggableProps.style?.transition,
          }}
        >
          <Card 
            className={`w-full bg-white hover:shadow-md transition-shadow relative ${
              isSelected ? 'ring-2 ring-primary' : ''
            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <div className="p-4 space-y-4 cursor-grab active:cursor-grabbing">
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
              <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </span>
                </div>
                
                {/* Collaboration Summary */}
                <div className="border-t border-border/50 pt-2 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between hover:bg-muted/50 -mx-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {collaborationsCount} Collaboration{collaborationsCount !== 1 ? 's' : ''} | {filledSpots}/{totalSpots} spots
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  
                  {/* Expanded Collaboration List */}
                  <div
                    className={cn(
                      "overflow-hidden transition-all",
                      isExpanded ? "max-h-40" : "max-h-0"
                    )}
                  >
                    <div className="space-y-1 pt-2">
                      {/* Mocked collaborations - will be replaced with real data */}
                      <div className="text-sm px-2 py-1 hover:bg-muted/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span>Instagram Story</span>
                          <span className="text-muted-foreground">2/5 spots</span>
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 hover:bg-muted/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span>Product Review</span>
                          <span className="text-muted-foreground">4/5 spots</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </Draggable>
  );
};