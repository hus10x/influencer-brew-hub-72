import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Building2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CollaborationSkeleton } from "@/components/dashboard/influencer/CollaborationSkeleton";

const InfluencerDashboard = () => {
  const navigate = useNavigate();

  const { data: collaborations = [], isLoading, refetch } = useQuery({
    queryKey: ['open-collaborations'],
    queryFn: async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.error('Session error:', sessionError);
          toast.error('Please log in to view collaborations');
          navigate('/login');
          return [];
        }

        const { data, error } = await supabase
          .from('collaborations')
          .select(`
            *,
            campaign:campaigns(
              *,
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
      } catch (error) {
        console.error('Error in queryFn:', error);
        toast.error('Error loading collaborations');
        return [];
      }
    },
    meta: {
      error: (error: Error) => {
        console.error('Query error:', error);
        toast.error(error.message);
      }
    }
  });

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please log in to view collaborations');
        navigate('/login');
        return;
      }
    };
    
    checkAuth();

    console.log('Setting up real-time subscription for collaborations...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborations'
        },
        async (payload) => {
          console.log('Collaboration change detected:', payload);
          await refetch();
          
          if (payload.eventType === 'INSERT' && payload.new.status === 'open') {
            toast.info('New collaboration opportunity available!');
          } else if (payload.eventType === 'DELETE') {
            toast.info('A collaboration has been removed');
          } else if (payload.eventType === 'UPDATE') {
            if (payload.old.status === 'open' && payload.new.status !== 'open') {
              toast.info('A collaboration is no longer available');
            }
          }
        }
      )
      .subscribe(async (status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to real-time updates');
        }
      });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate('/login');
      }
    });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      subscription.unsubscribe();
    };
  }, [navigate, refetch]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
          <div className="space-y-2 text-center py-8">
            <h1 className="text-4xl font-bold">Collab Now ✨</h1>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <CollaborationSkeleton key={index} />
            ))}
          </div>
        </main>
      </div>
    );
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
                    <p className="text-sm text-white font-medium">
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
                            {collab.requirements.map((req, index) => (
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
                    onClick={() => {
                      // TODO: Implement join collaboration logic
                      console.log('Join collaboration:', collab.id);
                    }}
                  >
                    Join Collaboration
                  </Button>
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