import { Card } from "@/components/ui/card";
import { CollaborationSkeleton } from "../influencer/CollaborationSkeleton";

export const KanbanSkeleton = () => {
  const columns = ["Draft", "Active", "Completed"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-13rem)]">
      {columns.map((status) => (
        <div
          key={status}
          className="flex flex-col h-full rounded-lg border border-primary/20 bg-primary/[0.03] dark:bg-primary/5"
        >
          <div className="flex items-center justify-between p-4 border-b border-primary/20">
            <div className="h-6 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-12 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[1, 2].map((i) => (
              <CollaborationSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};