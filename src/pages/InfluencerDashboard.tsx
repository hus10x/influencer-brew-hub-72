import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { CollaborationSkeleton } from "@/components/dashboard/influencer/CollaborationSkeleton";
import { CollaborationCardNew } from "@/components/dashboard/influencer/CollaborationCardNew";

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

  const handleJoinCollaboration = (collab: any) => {
    // TODO: Implement join collaboration logic
    console.log('Join collaboration:', collab.id);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
        <div className="space-y-2 text-center py-8">
          <h1 className="text-4xl font-bold">Collab Now ✨</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collaborations.map((collab) => (
            <CollaborationCardNew 
              key={collab.id} 
              collab={collab}
              onJoin={handleJoinCollaboration}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default InfluencerDashboard;
