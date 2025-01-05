import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { CollaborationCard } from "../CollaborationCard";
import { Tables } from "@/integrations/supabase/types";

interface CollaborationsListProps {
  collaborations: Tables<"collaborations">[];
  isExpanded: boolean;
  onToggle: () => void;
}

export const CollaborationsList = ({
  collaborations,
  isExpanded,
  onToggle,
}: CollaborationsListProps) => {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-between hover:bg-muted/50 -mx-2 mt-2"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm text-muted-foreground truncate">
            {collaborations.length} Collaboration{collaborations.length !== 1 ? 's' : ''} | 
            <span className="whitespace-nowrap">
              BHD {collaborations.length > 0 
                ? `${Math.min(...collaborations.map(c => c.compensation))}-${Math.max(...collaborations.map(c => c.compensation))} per collab`
                : 'No collaborations yet'
              }
            </span>
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        )}
      </Button>
      
      <div
        className={cn(
          "overflow-hidden transition-all",
          isExpanded ? "max-h-[500px]" : "max-h-0"
        )}
      >
        <div className="space-y-2 pt-2">
          {collaborations.map((collab) => (
            <CollaborationCard
              key={collab.id}
              collaboration={collab}
            />
          ))}
        </div>
      </div>
    </>
  );
};