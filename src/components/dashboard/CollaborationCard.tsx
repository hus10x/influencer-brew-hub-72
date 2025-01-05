import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { useState } from "react";
import { CollaborationModal } from "./kanban/CollaborationModal";
import { Tables } from "@/integrations/supabase/types";

interface CollaborationCardProps {
  collaboration: Tables<"collaborations">;
}

export const CollaborationCard = ({ collaboration }: CollaborationCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fillPercentage = (collaboration.filled_spots / collaboration.max_spots) * 100;

  return (
    <>
      <Card 
        className="w-full bg-card text-card-foreground hover:shadow-md transition-shadow cursor-pointer p-4 space-y-4"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{collaboration.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {collaboration.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>BHD {collaboration.compensation}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>
              {collaboration.filled_spots}/{collaboration.max_spots}
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <Progress value={fillPercentage} className="h-1.5" />
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">
              {fillPercentage.toFixed(0)}% filled
            </span>
          </div>
        </div>
      </Card>

      <CollaborationModal
        collaboration={collaboration}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};