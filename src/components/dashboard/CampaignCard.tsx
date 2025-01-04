import { CalendarDays, Users, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CampaignCardProps {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  collaborationsCount: number;
  onAddCollaboration: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const CampaignCard = ({
  title,
  description,
  startDate,
  endDate,
  collaborationsCount,
  onAddCollaboration,
  isSelected,
  onSelect,
}: CampaignCardProps) => {
  return (
    <Card className={`w-full bg-card hover:shadow-md transition-shadow group ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {onSelect && (
              <RadioGroup value={isSelected ? "selected" : "unselected"} onValueChange={() => onSelect()}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="selected" id="selected" className={`${!isSelected && 'opacity-0 group-hover:opacity-100'}`} />
                </div>
              </RadioGroup>
            )}
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onAddCollaboration}
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Add collaboration</span>
          </Button>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
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
      </CardContent>
    </Card>
  );
};