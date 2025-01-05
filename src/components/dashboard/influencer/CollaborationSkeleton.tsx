import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export const CollaborationSkeleton = () => {
  return (
    <div className="bg-card rounded-lg shadow-sm p-4">
      <div className="space-y-4">
        <div>
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mt-1" />
        </div>

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Progress value={0} className="h-1.5" />
        </div>
      </div>
    </div>
  );
};