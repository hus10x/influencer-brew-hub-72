import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";

const InfluencerDashboard = () => {
  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ['open-collaborations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          campaign:campaigns(
            id,
            business:businesses(
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

      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 px-4 space-y-6">
        <h1 className="text-2xl font-bold">Open Collaborations</h1>

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
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <CardHeader>
                      <CardTitle className="text-xl">{collab.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {collab.campaign?.business?.business_name}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{collab.description}</p>
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