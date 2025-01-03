import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
  initialData?: any;
}

export const FormActions = ({ isLoading, initialData }: FormActionsProps) => {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading 
        ? (initialData ? "Updating..." : "Creating...") 
        : (initialData ? "Update Collaboration" : "Create Collaboration")
      }
    </Button>
  );
};