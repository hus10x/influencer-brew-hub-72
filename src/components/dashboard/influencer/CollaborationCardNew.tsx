import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Building2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CollaborationCardProps {
  collab: any; // TODO: Add proper type
  onJoin: (collab: any) => void;
}

export const CollaborationCardNew = ({ collab, onJoin }: CollaborationCardProps) => {
  return (
    <Card className="flex flex-col">
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
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <div className="flex items-end gap-2">
            <Avatar className="h-10 w-10 rounded-md">
              <AvatarImage 
                src={collab.campaign?.business?.logo_url || ""} 
                alt={collab.campaign?.business?.business_name}
                className="rounded-md"
              />
              <AvatarFallback className="rounded-md">
                <Building2 className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-white font-medium pb-1">
              {collab.campaign?.business?.business_name || 'Unknown Business'}
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex-1">
          <div className="space-y-2">
            <CardHeader className="p-0">
              <CardTitle className="text-xl">{collab.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-sm text-muted-foreground">
                {collab.description}
              </p>
              
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Requirements:</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {collab.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Compensation:</h4>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">BHD {collab.compensation}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        <div className="mt-4">
          <Button 
            onClick={() => onJoin(collab)}
            className="w-full"
          >
            Join Collaboration
          </Button>
        </div>
      </div>
    </Card>
  );
};