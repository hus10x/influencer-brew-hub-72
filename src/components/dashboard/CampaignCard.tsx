import { CalendarDays, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
}

export const CampaignCard = ({
  title,
  description,
  startDate,
  endDate,
  collaborationsCount,
  onAddCollaboration,
}: CampaignCardProps) => {
  return (
    <Card className="w-full bg-card hover:shadow-md transition-shadow">
      <CardHeader className="space-y-1">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
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
            <span>{collaborationsCount} collaborations</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};