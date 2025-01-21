import { Progress } from "@/components/ui/progress";
import { Users } from "lucide-react";

interface CollaborationSpotsProps {
  filledSpots: number;
  maxSpots: number;
}

export const CollaborationSpots = ({ filledSpots, maxSpots }: CollaborationSpotsProps) => {
  const fillPercentage = (filledSpots / maxSpots) * 100;

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return "text-red-500";
    if (percentage >= 80) return "text-orange-500";
    return "text-green-500";
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-orange-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${getStatusColor(fillPercentage)}`} />
          <span className="text-sm">
            {filledSpots}/{maxSpots} spots filled
          </span>
        </div>
      </div>
      <Progress
        value={fillPercentage}
        className="h-1.5"
        indicatorClassName={getProgressColor(fillPercentage)}
      />
    </div>
  );
};