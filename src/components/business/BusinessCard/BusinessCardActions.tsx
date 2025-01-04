import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface BusinessCardActionsProps {
  business: Tables<"businesses">;
  onEdit: (business: Tables<"businesses">) => void;
  canDelete: boolean;
  onDeleteClick: () => void;
}

export const BusinessCardActions = ({
  business,
  onEdit,
  canDelete,
  onDeleteClick,
}: BusinessCardActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onEdit(business)}
        className="hover:bg-muted"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        className="hover:bg-muted"
        disabled={!canDelete}
        onClick={onDeleteClick}
        title={!canDelete ? "You must maintain at least one business profile" : "Delete business"}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
};