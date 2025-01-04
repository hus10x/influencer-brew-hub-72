import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { DollarSign } from "lucide-react";

const InfluencerDashboard = () => {
  const navigate = useNavigate();
  
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['open-collaborations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          campaign:campaigns!inner(
            id,
            title,
            business:businesses!inner(
              id,
              business_name,
              logo_url
            )
          )
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching collaborations:', error);
        throw error;
      }

      return data || [];
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 px-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Available Collaborations</h1>
          <Button variant="outline" onClick={() => navigate('/influencer/profile')}>
            View Profile
          </Button>
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
                        {collab.campaign?.business?.business_name}
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