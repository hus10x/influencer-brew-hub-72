import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

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
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={business.logo_url || ""} alt={business.business_name} />
          <AvatarFallback>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{business.business_name}</h3>
          {business.industry && (
            <Badge variant="secondary" className="mt-1">
              {business.industry}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(business)}
            className="hover:bg-muted"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:bg-muted"
                disabled={!canDelete}
                title={!canDelete ? "You must maintain at least one business profile" : "Delete business"}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
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
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="Type 'yes' to confirm"
                  className="max-w-sm"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmation("")}>
                  Cancel
                </AlertDialogCancel>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Business"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </Card>
  );
};