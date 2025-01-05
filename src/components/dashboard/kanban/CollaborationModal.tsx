import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { CollaborationForm } from "../collaboration-form/CollaborationForm";
import { Tables } from "@/integrations/supabase/types";
import { useDeleteCollaboration } from "@/hooks/use-delete-collaboration";
import { CollaborationModalHeader } from "./modal/CollaborationModalHeader";
import { CollaborationModalDetails } from "./modal/CollaborationModalDetails";

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

  const handleEditSuccess = () => {
    setIsEditing(false);
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this collaboration? This action cannot be undone.")) {
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
          <CollaborationModalHeader
            title="Edit Collaboration"
            onEdit={() => {}}
            onDelete={handleDelete}
            isDeleting={deleteCollaboration.isPending}
          />
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
        <CollaborationModalHeader
          title={collaboration.title}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          isDeleting={deleteCollaboration.isPending}
        />
        <CollaborationModalDetails collaboration={collaboration} />
      </DialogContent>
    </Dialog>
  );
};