import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  isEditing?: boolean;
  isStandalone?: boolean;
}

export const FormActions = ({ isLoading, isEditing, isStandalone }: FormActionsProps) => {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading 
        ? (isEditing ? "Updating..." : "Creating...") 
        : (isEditing ? "Update Collaboration" : "Create Collaboration")
      }
    </Button>
  );
};