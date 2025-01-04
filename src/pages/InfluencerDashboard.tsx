import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const InfluencerDashboard = () => {
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['open-collaborations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          campaign:campaigns(
            *,
            business:businesses(*)
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collaborations:', error);
        throw error;
      }

      console.log('Raw data from query:', data);

      // Filter out collaborations where campaign or business is null
      const validCollaborations = data?.filter(collab => {
        console.log('Checking collaboration:', collab);
        const isValid = collab && collab.campaign && collab.campaign.business;
        if (!isValid) {
          console.log('Invalid collaboration found:', {
            hasCollab: !!collab,
            hasCampaign: !!(collab && collab.campaign),
            hasBusiness: !!(collab && collab.campaign && collab.campaign.business)
          });
        }
        return isValid;
      }) || [];

      console.log('Filtered collaborations:', validCollaborations);
      return validCollaborations;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
        <div className="space-y-2 text-center py-8">
          <h1 className="text-4xl font-bold">Collab Now ✨</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collaborations.map((collab) => (
            <Card key={collab.id} className="flex flex-col">
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
                      <p className="text-sm text-muted-foreground">
                        {collab.campaign?.business?.business_name || 'Unknown Business'}
                      </p>
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
                        <Button 
                          onClick={() => {
                            // TODO: Implement join collaboration logic
                            console.log('Join collaboration:', collab.id);
                          }}
                        >
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
      </main>
    </div>
  );
};

export default InfluencerDashboard;