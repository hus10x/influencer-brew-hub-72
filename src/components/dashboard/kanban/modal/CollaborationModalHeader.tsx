import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface CollaborationModalHeaderProps {
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const CollaborationModalHeader = ({
  title,
  onEdit,
  onDelete,
  isDeleting,
}: CollaborationModalHeaderProps) => {
  const [deleteState, setDeleteState] = useState<'initial' | 'confirm'>('initial');
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup timeout on unmount
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const handleDeleteClick = () => {
    if (deleteState === 'initial') {
      setDeleteState('confirm');
      // Reset state after 3 seconds
      const id = window.setTimeout(() => {
        setDeleteState('initial');
      }, 3000);
      setTimeoutId(id);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setDeleteState('initial');
      onDelete();
    }
  };

  return (
    <DialogHeader className="pr-12">
      <div className="flex justify-between items-center gap-4">
        <div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Collaboration Details</DialogDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant={deleteState === 'confirm' ? "destructive" : "outline"}
            size="icon"
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            <Trash2 className={`h-4 w-4 ${deleteState === 'confirm' ? 'animate-pulse' : ''}`} />
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
};