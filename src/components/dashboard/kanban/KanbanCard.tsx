import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Users,
  Plus,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollaborationCard } from "./CollaborationCard";

interface KanbanCardProps {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isSelected: boolean;
  onSelect: () => void;
  index: number;
  selectionMode: boolean;
  collaborationsCount?: number; // Added this prop
}

export const KanbanCard = ({
  id,
  title,
  description,
  startDate,
  endDate,
  isSelected,
  onSelect,
  index,
  selectionMode,
  collaborationsCount = 0, // Added with default value
}: KanbanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { data: collaborations = [] } = useQuery({
    queryKey: ["collaborations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .eq("campaign_id", id);

      if (error) throw error;
      return data;
    },
  });

  const totalSpots = collaborations.reduce((acc, collab) => acc + collab.max_spots, 0);
  const filledSpots = collaborations.reduce((acc, collab) => acc + collab.filled_spots, 0);
  const fillPercentage = totalSpots > 0 ? (filledSpots / totalSpots) * 100 : 0;
  
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
                        console.log("Add collaboration clicked");
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress 
                      value={fillPercentage} 
                      className="h-1.5"
                      indicatorClassName={getProgressColor(fillPercentage)}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between hover:bg-muted/50 -mx-2 mt-2"
                    onClick={() => setIsExpanded(!isExpanded)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm text-muted-foreground truncate">
                        {collaborations.length} Collaboration{collaborations.length !== 1 ? 's' : ''} | 
                        <DollarSign className="h-3 w-3 inline mx-1" />
                        <span className="whitespace-nowrap">
                          {collaborations.length > 0 
                            ? `${Math.min(...collaborations.map(c => c.compensation))}-${Math.max(...collaborations.map(c => c.compensation))} per collab`
                            : 'No collaborations yet'
                          }
                        </span>
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </Button>
                  
                  <div
                    className={cn(
                      "overflow-hidden transition-all",
                      isExpanded ? "max-h-[500px]" : "max-h-0"
                    )}
                  >
                    <div className="space-y-2 pt-2">
                      {collaborations.map((collab) => (
                        <CollaborationCard
                          key={collab.id}
                          collaboration={collab}
                        />
                      ))}
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