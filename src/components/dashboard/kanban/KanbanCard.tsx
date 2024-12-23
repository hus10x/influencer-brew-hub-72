import { Card } from "@/components/ui/card";
import { Check, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users } from "lucide-react";

interface KanbanCardProps {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  collaborationsCount: number;
  isSelected: boolean;
  onSelect: () => void;
}

export const KanbanCard = ({
  id,
  title,
  description,
  startDate,
  endDate,
  collaborationsCount,
  isSelected,
  onSelect,
}: KanbanCardProps) => {
  return (
    <Card className={`w-full bg-card hover:shadow-md transition-shadow group ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? (
                <Check className="h-4 w-4 text-primary" />
              ) : (
                <GripVertical className="h-4 w-4 text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Button>
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{collaborationsCount} collaboration{collaborationsCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};