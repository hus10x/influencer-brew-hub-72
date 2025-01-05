import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CollaborationCardNew } from "@/components/dashboard/influencer/CollaborationCardNew";
import { CollaborationDialog } from "@/components/dashboard/kanban/CollaborationDialog";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const InfluencerDashboard = () => {
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: collaborations = [], isLoading } = useQuery({
    queryKey: ["collaborations", "influencer"],
    queryFn: async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");

        const { data, error } = await supabase
          .from("collaborations")
          .select(`
            *,
            campaign:campaigns (
              id,
              title,
              description,
              start_date,
              end_date,
              status,
              business:businesses (
                id,
                business_name,
                logo_url
              )
            )
          `)
          .eq('status', 'open')
          .eq('campaign.status', 'active') // Only show collaborations from active campaigns
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching collaborations:", error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error("Error in query:", error);
        throw error;
      }
    },
  });

  const handleJoinCollaboration = (collab: any) => {
    setSelectedCollaboration(collab);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <main className="container mx-auto p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Available Collaborations</h1>
            <p className="text-muted-foreground mt-2">
              Browse and join available collaboration opportunities
            </p>
          </div>

          {collaborations.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium">No collaborations available</h3>
              <p className="text-muted-foreground mt-2">
                Check back later for new opportunities
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collaborations.map((collab) => (
                <CollaborationCardNew
                  key={collab.id}
                  collab={collab}
                  onJoin={handleJoinCollaboration}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CollaborationDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        collaboration={selectedCollaboration}
      />
    </div>
  );
};

export default InfluencerDashboard;