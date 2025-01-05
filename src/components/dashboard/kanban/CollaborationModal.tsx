import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { DollarSign, Users, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { CollaborationForm } from "../collaboration-form/CollaborationForm";
import { Tables } from "@/integrations/supabase/types";
import { useDeleteCollaboration } from "@/hooks/use-delete-collaboration";

interface CollaborationModalProps {
  collaboration: Tables<"collaborations"> | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationModal = ({
  collaboration,
  isOpen,
  onClose,
}: CollaborationModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const deleteCollaboration = useDeleteCollaboration(onClose);

  if (!collaboration) return null;

  const fillPercentage = (collaboration.filled_spots / collaboration.max_spots) * 100;

  const handleEditSuccess = () => {
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this collaboration?")) {
      await deleteCollaboration.mutateAsync(collaboration.id);
    }
  };

  if (isEditing) {
    const formData = {
      id: collaboration.id,
      campaignId: collaboration.campaign_id,
      title: collaboration.title,
      description: collaboration.description,
      requirements: collaboration.requirements,
      compensation: collaboration.compensation,
      deadline: new Date(collaboration.deadline),
      maxSpots: collaboration.max_spots,
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Collaboration</DialogTitle>
          </DialogHeader>
          <CollaborationForm
            onSuccess={handleEditSuccess}
            initialData={formData}
            isStandalone={false}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pr-12">
          <div className="flex justify-between items-center gap-4">
            <div>
              <DialogTitle>{collaboration.title}</DialogTitle>
              <DialogDescription>Collaboration Details</DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={handleDelete}
                disabled={deleteCollaboration.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {collaboration.image_url && (
            <div className="relative w-full h-48">
              <img
                src={collaboration.image_url}
                alt={collaboration.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {collaboration.description}
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

            <div className="flex justify-between items-center pt-2">
              <div>
                <h4 className="text-sm font-medium">Compensation</h4>
                <p className="text-sm text-muted-foreground">
                  ${collaboration.compensation}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Deadline</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(collaboration.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Available Spots</h4>
                <p className="text-sm text-muted-foreground">
                  {collaboration.max_spots - collaboration.filled_spots} remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {collaboration.filled_spots}/{collaboration.max_spots} spots filled
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {fillPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={fillPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};