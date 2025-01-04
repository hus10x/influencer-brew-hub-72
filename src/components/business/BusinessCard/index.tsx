import { Card } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BusinessCardHeader } from "./BusinessCardHeader";
import { BusinessCardActions } from "./BusinessCardActions";
import { DeleteBusinessDialog } from "./DeleteBusinessDialog";

interface BusinessCardProps {
  business: Tables<"businesses">;
  onEdit: (business: Tables<"businesses">) => void;
  onDelete: () => void;
  canDelete: boolean;
}

export const BusinessCard = ({ business, onEdit, onDelete, canDelete }: BusinessCardProps) => {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add console log to debug business data in main component
  console.log("Business data in main BusinessCard:", business);

  const handleDelete = async () => {
    if (!canDelete) {
      toast.error("You must maintain at least one business profile");
      return;
    }

    if (deleteConfirmation.toLowerCase() !== "yes") {
      toast.error("Please type 'yes' to confirm deletion");
      return;
    }

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", business.id);

      if (error) throw error;

      toast.success("Business deleted successfully");
      onDelete();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("Failed to delete business");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-card text-card-foreground">
      <div className="flex items-center gap-4">
        <BusinessCardHeader business={business} />
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogTrigger asChild>
            <BusinessCardActions
              business={business}
              onEdit={onEdit}
              canDelete={canDelete}
              onDeleteClick={() => setIsDeleteDialogOpen(true)}
            />
          </AlertDialogTrigger>
          <DeleteBusinessDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            deleteConfirmation={deleteConfirmation}
            onDeleteConfirmationChange={setDeleteConfirmation}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        </AlertDialog>
      </div>
    </Card>
  );
};