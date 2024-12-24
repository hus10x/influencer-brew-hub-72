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
        {selectionMode && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
            <Check className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
          </Button>
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
      >
        Edit
      </Button>
    </div>
  );
};