import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { CollaborationSpots } from "./CollaborationSpots";

interface JoinCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboration: Tables<"collaborations"> & {
    campaign: Tables<"campaigns"> & {
      business: Tables<"businesses">;
    };
  };
}

export const JoinCollaborationModal = ({
  isOpen,
  onClose,
  collaboration,
}: JoinCollaborationModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleJoinCollaboration = async () => {
    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please log in to join collaborations");
        return;
      }

      // Check if spots are available
      if (collaboration.filled_spots >= collaboration.max_spots) {
        toast.error("Sorry, all spots have been filled");
        return;
      }

      // Check if user has already submitted
      const { data: existingSubmission } = await supabase
        .from("collaboration_submissions")
        .select()
        .eq("collaboration_id", collaboration.id)
        .eq("influencer_id", user.id)
        .single();

      if (existingSubmission) {
        toast.error("You have already applied for this collaboration");
        return;
      }

      // Create submission
      const { error: submissionError } = await supabase
        .from("collaboration_submissions")
        .insert({
          collaboration_id: collaboration.id,
          influencer_id: user.id,
          status: "pending"
        });

      if (submissionError) throw submissionError;

      toast.success("Successfully joined collaboration!");
      queryClient.invalidateQueries({ queryKey: ["open-collaborations"] });
      onClose();
    } catch (error) {
      console.error("Error joining collaboration:", error);
      toast.error("Failed to join collaboration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Join Collaboration</DialogTitle>
          <DialogDescription>
            Apply to participate in this collaboration opportunity
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Business</h4>
            <p className="text-sm text-muted-foreground">
              {collaboration.campaign.business.business_name}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Campaign</h4>
            <p className="text-sm text-muted-foreground">
              {collaboration.campaign.title}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Requirements</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {collaboration.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Compensation</h4>
            <p className="text-sm text-muted-foreground">
              BHD {collaboration.compensation}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-1">Available Spots</h4>
            <CollaborationSpots 
              filledSpots={collaboration.filled_spots} 
              maxSpots={collaboration.max_spots} 
            />
          </div>

          <div className="pt-4 space-x-2 flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleJoinCollaboration}
              disabled={isSubmitting || collaboration.filled_spots >= collaboration.max_spots}
            >
              {isSubmitting ? "Joining..." : "Join Collaboration"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};