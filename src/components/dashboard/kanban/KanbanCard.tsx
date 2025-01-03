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

// ... keep existing code (interfaces and types)

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

  // ... keep existing code (query and handlers)

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
            className={`w-full bg-card dark:bg-card hover:shadow-md transition-shadow relative ${
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
                <div className="flex items-center text-sm text-muted-foreground dark:text-muted-foreground/70">
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

          {/* ... keep existing code (dialogs) */}
        </div>
      )}
    </Draggable>
  );
};
