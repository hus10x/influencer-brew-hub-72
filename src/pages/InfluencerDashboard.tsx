import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CollaborationsList } from "@/components/dashboard/influencer/CollaborationsList";

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
              business:businesses(*)
            )
          `)
          .eq('status', 'open')
          .eq('campaign.status', 'active')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching collaborations:', error);
          throw error;
        }

        return data || [];
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

    console.log('Setting up real-time subscriptions...');
    
    // Subscribe to both collaboration and campaign changes
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
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'campaigns'
        },
        async (payload) => {
          console.log('Campaign status change detected:', payload);
          if (payload.old.status === 'draft' && payload.new.status === 'active') {
            console.log('Campaign activated, refetching collaborations...');
            await refetch();
            toast.info('New campaign activated with collaboration opportunities!');
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

  const handleJoinCollaboration = (collaborationId: string) => {
    // TODO: Implement join collaboration logic
    console.log('Join collaboration:', collaborationId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto py-6 px-4 space-y-6 pt-24">
        <div className="space-y-2 text-center py-8">
          <h1 className="text-4xl font-bold">Collab Now ✨</h1>
        </div>

        <CollaborationsList 
          collaborations={collaborations}
          isLoading={isLoading}
          onJoinCollaboration={handleJoinCollaboration}
        />
      </main>
    </div>
  );
};

export default InfluencerDashboard;
