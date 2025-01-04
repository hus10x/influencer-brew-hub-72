import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface FormHeaderProps {
  isEditing?: boolean;
}

export const FormHeader = ({ isEditing }: FormHeaderProps) => (
  <DialogHeader>
    <DialogTitle>{isEditing ? "Edit Collaboration" : "Create New Collaboration"}</DialogTitle>
    <DialogDescription>
      {isEditing ? "Update collaboration details" : "Add a new collaboration opportunity for this campaign"}
    </DialogDescription>
  </DialogHeader>
);