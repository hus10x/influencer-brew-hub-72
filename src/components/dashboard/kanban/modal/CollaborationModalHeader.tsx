import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

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
            variant="destructive"
            size="icon"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </DialogHeader>
  );
};