import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";
import { useState, useEffect } from "react";
import { CollaborationModal } from "@/components/dashboard/kanban/CollaborationModal";
import { Tables } from "@/integrations/supabase/types";
import { VerificationStatus } from "@/components/dashboard/influencer/VerificationStatus";
import { supabase } from "@/integrations/supabase/client";

interface CollaborationCardProps {
  collaboration: Tables<"collaborations">;
}

export const CollaborationCard = ({ collaboration: initialCollaboration }: CollaborationCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaboration, setCollaboration] = useState(initialCollaboration);

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborations',
          filter: `id=eq.${collaboration.id}`
        },
        (payload) => {
          console.log('Collaboration update received:', payload);
          if (payload.new) {
            setCollaboration(payload.new as Tables<"collaborations">);
          }
        }
      )
      .subscribe(async (status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [collaboration.id]);

  const fillPercentage = (collaboration.filled_spots / collaboration.max_spots) * 100;

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
      <div
        className="bg-card rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{collaboration.title}</h3>
              <VerificationStatus status={collaboration.status} />
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {collaboration.description}
            </p>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Compensation:</span>
            <span className="font-medium">BHD {collaboration.compensation}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className={`h-4 w-4 ${getStatusColor(fillPercentage)}`} />
                <span className="text-sm">
                  {collaboration.filled_spots}/{collaboration.max_spots} spots filled
                </span>
              </div>
            </div>
            <Progress
              value={fillPercentage}
              className="h-1.5"
              indicatorClassName={getProgressColor(fillPercentage)}
            />
          </div>
        </div>
      </div>

      <CollaborationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        collaboration={collaboration}
      />
    </>
  );
};