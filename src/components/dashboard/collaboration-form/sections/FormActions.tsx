import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  isEditing?: boolean;
  isStandalone?: boolean;
}

export const FormActions = ({ isLoading, isEditing, isStandalone = true }: FormActionsProps) => {
  // Only hide the button when it's embedded in the campaign form
  if (!isStandalone && !isEditing && !document.querySelector('.dialog-form')) return null;
  
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading 
        ? (isEditing ? "Updating..." : "Creating...") 
        : (isEditing ? "Update Collaboration" : "Create Collaboration")
      }
    </Button>
  );
};