import React, { useState } from "react";
import { CalendarDays, Building2 } from "lucide-react";
import { Draggable } from "@hello-pangea/dnd";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  businessId: string;
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
  businessId,
}: KanbanCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollabDialogOpen, setIsCollabDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: business, isLoading: isLoadingBusiness } = useQuery({
    queryKey: ["business", businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", businessId)
        .single();

      if (error) {
        console.error("Error fetching business:", error);
        throw error;
      }

      return data;
    },
    enabled: !!businessId,
  });

  const { data: collaborations = [], isLoading: isLoadingCollaborations } = useQuery({
    queryKey: ["collaborations", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collaborations")
        .select("*")
        .eq("campaign_id", id);

      if (error) {
        console.error("Error fetching collaborations:", error);
        throw error;
      }

      return data || [];
    },
  });

  const totalSpots = collaborations.reduce((sum, collab) => sum + (collab.max_spots || 0), 0);
  const filledSpots = collaborations.reduce((sum, collab) => sum + (collab.filled_spots || 0), 0);

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
          <div 
            className={`w-full bg-card text-card-foreground hover:shadow-md transition-shadow relative border border-primary/10 ${
              isSelected ? 'ring-2 ring-primary' : ''
            } ${snapshot.isDragging ? 'shadow-lg' : ''}`}
          >
            <div className="p-4 space-y-4 cursor-grab active:cursor-grabbing">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border border-border">
                  <AvatarImage 
                    src={business?.logo_url} 
                    alt={business?.business_name} 
                  />
                  <AvatarFallback>
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardHeader
                    title={title}
                    selectionMode={selectionMode}
                    isSelected={isSelected}
                    onSelect={onSelect}
                    onEdit={() => setIsEditDialogOpen(true)}
                  />
                  
                  <p className="text-sm text-foreground/80 dark:text-foreground/70 line-clamp-2 mt-2">
                    {description}
                  </p>
                </div>
              </div>
              
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
          </div>

          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
              <DialogHeader>
                <DialogTitle>Edit Campaign</DialogTitle>
                <DialogDescription>
                  Update campaign details
                </DialogDescription>
              </DialogHeader>
              <CampaignForm
                onSuccess={() => setIsEditDialogOpen(false)}
                campaign={{
                  id,
                  title,
                  description,
                  start_date: startDate.toISOString(),
                  end_date: endDate.toISOString(),
                  business_id: businessId,
                }}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isCollabDialogOpen} onOpenChange={setIsCollabDialogOpen}>
            <DialogContent className="max-w-[600px] max-h-[90vh] overflow-y-auto bg-card">
              <DialogHeader>
                <DialogTitle>Create New Collaboration</DialogTitle>
                <DialogDescription>
                  Add a new collaboration opportunity for this campaign
                </DialogDescription>
              </DialogHeader>
              <CollaborationForm
                campaignId={id}
                onSuccess={() => setIsCollabDialogOpen(false)}
                isStandalone={false}
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
};