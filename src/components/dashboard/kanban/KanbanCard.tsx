import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Users,
  Plus,
  DollarSign
} from "lucide-react";
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
  const fillPercentage = (filledSpots / totalSpots) * 100;
  
  // Determine status color based on fill percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

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
                
                {/* Collaboration Summary Section */}
                <div className="border-t border-border/50 pt-2 mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className={`h-4 w-4 ${getStatusColor(fillPercentage)}`} />
                      <span className="text-sm">
                        {filledSpots}/{totalSpots} spots filled
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Implement add collaboration
                        console.log("Add collaboration clicked");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <Progress 
                      value={fillPercentage} 
                      className="h-1.5"
                      indicatorClassName={getProgressColor(fillPercentage)}
                    />
                  </div>
                  
                  {/* Expandable Collaboration Details */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between hover:bg-muted/50 -mx-2 mt-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-muted-foreground truncate">
                        {collaborationsCount} Collaboration{collaborationsCount !== 1 ? 's' : ''} | 
                        <DollarSign className="h-3 w-3 inline mx-1" />
                        <span className="whitespace-nowrap">500-1000 per collab</span>
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
                          <span className="truncate">Instagram Story</span>
                          <span className="text-muted-foreground ml-2 flex-shrink-0">2/5 spots</span>
                        </div>
                      </div>
                      <div className="text-sm px-2 py-1 hover:bg-muted/50 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="truncate">Product Review</span>
                          <span className="text-muted-foreground ml-2 flex-shrink-0">4/5 spots</span>
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