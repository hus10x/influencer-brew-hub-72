import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Building2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface CollaborationsListProps {
  collaborations: Tables<"collaborations">[];
  isLoading: boolean;
  onJoinCollaboration: (id: string) => void;
}

export const CollaborationsList = ({ 
  collaborations, 
  isLoading, 
  onJoinCollaboration 
}: CollaborationsListProps) => {
  if (isLoading) {
    return <div className="flex items-center justify-center">Loading...</div>;
  }

  if (collaborations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No open collaborations available.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {collaborations.map((collab) => (
        <Card key={collab.id}>
          <div className="relative h-48 w-full">
            {collab.image_url ? (
              <img
                src={collab.image_url}
                alt={collab.title}
                className="h-full w-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center rounded-t-lg">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl">{collab.title}</CardTitle>
                  {collab.campaign?.business?.business_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building2 className="h-4 w-4" />
                      <span>{collab.campaign.business.business_name}</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-sm text-muted-foreground">
                    {collab.description}
                  </p>
                  
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Requirements:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {collab.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span className="text-sm font-medium">{collab.compensation}</span>
                    </div>
                    <Button onClick={() => onJoinCollaboration(collab.id)}>
                      Join Collaboration
                    </Button>
                  </div>
                </CardContent>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};