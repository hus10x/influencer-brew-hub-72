import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

interface DeleteBusinessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  deleteConfirmation: string;
  onDeleteConfirmationChange: (value: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export const DeleteBusinessDialog = ({
  isOpen,
  onOpenChange,
  deleteConfirmation,
  onDeleteConfirmationChange,
  onDelete,
  isDeleting,
}: DeleteBusinessDialogProps) => {
  return (
    <AlertDialogContent className="bg-card">
      <AlertDialogHeader>
        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete your
          business profile and remove all data associated with it.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground mb-2">
          Type <span className="font-semibold">yes</span> to confirm deletion
        </p>
        <Input
          value={deleteConfirmation}
          onChange={(e) => onDeleteConfirmationChange(e.target.value)}
          placeholder="Type 'yes' to confirm"
          className="max-w-sm"
        />
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => onDeleteConfirmationChange("")}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={onDelete}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Business"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
};