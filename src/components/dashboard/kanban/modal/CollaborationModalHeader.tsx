import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="hover:bg-destructive/90 hover:text-destructive-foreground"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <div className="space-y-3">
                <p className="text-sm font-medium">Delete collaboration?</p>
                <p className="text-sm text-muted-foreground">
                  This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3"
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="px-3"
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </DialogHeader>
  );
};