import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CollaborationForm } from "../collaboration-form/CollaborationForm";
import { CardHeader } from "./card/CardHeader";
import { CardMetrics } from "./card/CardMetrics";
import { CollaborationsList } from "./card/CollaborationsList";
import { CampaignForm } from "../CampaignForm";

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
  collaborationsCount?: number;
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
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleCollabDialogClose = () => {
    setIsCollabDialogOpen(false);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
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
            className={`w-full bg-card dark:bg-card/95 hover:shadow-md transition-shadow relative ${
              isSelected ? 'ring-2 ring-primary' : ''
            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <div className="p-4 space-y-4 cursor-grab active:cursor-grabbing">
              <CardHeader
                title={title}
                selectionMode={selectionMode}
                isSelected={isSelected}
                onSelect={onSelect}
                onEdit={() => setIsEditDialogOpen(true)}
              />
              
              <p className="text-sm text-foreground/80 dark:text-foreground/70 line-clamp-2">{description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                  </span>
                </div>
                
                <CardMetrics
                  totalSpots={totalSpots}
                  filledSpots={filledSpots}
                  onAddCollaboration={() => setIsCollabDialogOpen(true)}
                />
                
                <CollaborationsList
                  collaborations={collaborations}
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded(!isExpanded)}
                />
              </div>
            </div>
          </Card>

          <Dialog open={isCollabDialogOpen} onOpenChange={setIsCollabDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Collaboration</DialogTitle>
                <DialogDescription>
                  Add a new collaboration to the campaign "{title}"
                </DialogDescription>
              </DialogHeader>
              <CollaborationForm
                campaignId={id}
                onSuccess={handleCollabDialogClose}
                isStandalone={false}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Campaign</DialogTitle>
                <DialogDescription>
                  Update the campaign details
                </DialogDescription>
              </DialogHeader>
              <CampaignForm
                campaign={{
                  id,
                  title,
                  description,
                  start_date: startDate.toISOString(),
                  end_date: endDate.toISOString(),
                }}
                onSuccess={handleEditDialogClose}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};
