import { Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CardMetricsProps {
  totalSpots: number;
  filledSpots: number;
  onAddCollaboration: () => void;
}

export const CardMetrics = ({ totalSpots, filledSpots, onAddCollaboration }: CardMetricsProps) => {
  const fillPercentage = totalSpots > 0 ? (filledSpots / totalSpots) * 100 : 0;
  
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
    <div className="border-t border-border/50 pt-2 mt-2">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Users className={`h-4 w-4 ${getStatusColor(fillPercentage)}`} />
          <span className="text-sm">
            {filledSpots}/{totalSpots} spots filled
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={(e) => {
            e.stopPropagation();
            onAddCollaboration();
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="space-y-2">
        <Progress 
          value={fillPercentage} 
          className="h-1.5"
          indicatorClassName={getProgressColor(fillPercentage)}
        />
      </div>
    </div>
  );
};