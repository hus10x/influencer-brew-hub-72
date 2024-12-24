import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Users } from "lucide-react";

interface CollaborationModalProps {
  collaboration: {
    title: string;
    description: string;
    compensation: number;
    max_spots: number;
    filled_spots: number;
    requirements: string[];
    deadline: string;
    image_url: string | null;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationModal = ({
  collaboration,
  isOpen,
  onClose,
}: CollaborationModalProps) => {
  if (!collaboration) return null;

  const fillPercentage = (collaboration.filled_spots / collaboration.max_spots) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{collaboration.title}</DialogTitle>
          <DialogDescription>Collaboration Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {collaboration.image_url && (
            <div className="relative w-full h-48">
              <img
                src={collaboration.image_url}
                alt={collaboration.title}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Description</h4>
              <p className="text-sm text-muted-foreground">
                {collaboration.description}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Requirements</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {collaboration.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div>
                <h4 className="text-sm font-medium">Compensation</h4>
                <p className="text-sm text-muted-foreground">
                  ${collaboration.compensation}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Deadline</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(collaboration.deadline).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Available Spots</h4>
                <p className="text-sm text-muted-foreground">
                  {collaboration.max_spots - collaboration.filled_spots} remaining
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">
                    {collaboration.filled_spots}/{collaboration.max_spots} spots filled
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {fillPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={fillPercentage} className="h-2" />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};