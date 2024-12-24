import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Users,
  Plus,
  DollarSign,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

interface Collaboration {
  id: string;
  title: string;
  description: string;
  compensation: number;
  max_spots: number;
  filled_spots: number;
  requirements: string[];
  deadline: string;
  image_url: string | null;
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
}: KanbanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCollaboration, setSelectedCollaboration] = useState<Collaboration | null>(null);

  const { data: collaborations = [] } = useQuery({
    queryKey: ["collaborations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .eq("campaign_id", id);

      if (error) throw error;
      return data as Collaboration[];
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
    <>
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
                        isExpanded ? "max-h-40" : "max-h-0"
                      )}
                    >
                      <div className="space-y-1 pt-2">
                        {collaborations.map((collab) => (
                          <div 
                            key={collab.id}
                            className="text-sm px-2 py-1 hover:bg-muted/50 rounded-md cursor-pointer"
                            onClick={() => setSelectedCollaboration(collab)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="truncate">{collab.title}</span>
                              <span className="text-muted-foreground ml-2 flex-shrink-0">
                                {collab.filled_spots}/{collab.max_spots} spots
                              </span>
                            </div>
                          </div>
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

      <Dialog open={!!selectedCollaboration} onOpenChange={() => setSelectedCollaboration(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              {selectedCollaboration?.title}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setSelectedCollaboration(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Collaboration Details
            </DialogDescription>
          </DialogHeader>

          {selectedCollaboration && (
            <div className="space-y-4">
              {selectedCollaboration.image_url && (
                <div className="relative w-full h-48">
                  <img
                    src={selectedCollaboration.image_url}
                    alt={selectedCollaboration.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedCollaboration.description}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-1">Requirements</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedCollaboration.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div>
                    <h4 className="text-sm font-medium">Compensation</h4>
                    <p className="text-sm text-muted-foreground">
                      ${selectedCollaboration.compensation}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Deadline</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedCollaboration.deadline).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Available Spots</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCollaboration.max_spots - selectedCollaboration.filled_spots} remaining
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};