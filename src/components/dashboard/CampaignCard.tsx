import { CalendarDays, Users, Plus, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
          <div className="flex items-center gap-4">
            {onSelect && (
              <div className={`${!isSelected && 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                <RadioGroup value={isSelected ? "selected" : "unselected"} onValueChange={() => onSelect()}>
                  <RadioGroupItem value="selected" id="selected" />
                </RadioGroup>
              </div>
            )}
            <Avatar className="h-12 w-12 border border-border">
              <AvatarImage src={undefined} alt="Business Logo" />
              <AvatarFallback>
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-2">{description}</CardDescription>
            </div>
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