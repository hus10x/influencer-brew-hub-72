import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface CardHeaderProps {
  title: string;
  selectionMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
}

export const CardHeader = ({
  title,
  selectionMode,
  isSelected,
  onSelect,
  onEdit,
}: CardHeaderProps) => {
  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {!selectionMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-primary hover:text-primary/90"
        >
          Edit
        </Button>
      )}
    </div>
  );
};