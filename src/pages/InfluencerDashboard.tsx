import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InstagramConnect } from "@/components/InstagramConnect";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkInstagramConnection } from "@/utils/checkInstagramConnection";
import { Loader2 } from "lucide-react";

const InfluencerDashboard = () => {
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      if (profile?.email) {
        const instagramStatus = await checkInstagramConnection(profile.email);
        console.log('Instagram connection status:', instagramStatus);
      }

      return profile;
    },
  });

  const { data: collaborations, isLoading: isCollaborationsLoading, error: collaborationsError } = useQuery({
    queryKey: ['open_collaborations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collaborations')
        .select(`
          *,
          business:businesses(
            id,
            business_name,
            logo_url
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

  if (profileError || collaborationsError) {
    toast.error('Failed to load dashboard data');
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-20 pb-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <p>Something went wrong. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  const isLoading = isProfileLoading || isCollaborationsLoading;
  const isTestUser = profile?.email === 'test.influencer@example.com';
  const isInstagramConnected = isTestUser || profile?.instagram_connected || false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-20 pb-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-20 pb-20">
        {!isInstagramConnected ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <div className="relative isolate overflow-hidden bg-muted/50 dark:bg-background/95 py-16 sm:py-24 rounded-3xl w-full">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl mt-8 mb-8">
                    Collab Now ✨
                  </h1>
                  <p className="mt-6 text-lg leading-8 text-muted-foreground">
                    Effortless collabs. Real connections.
                  </p>
                  <div className="mt-10 flex justify-center">
                    <InstagramConnect />
                  </div>
                </div>
              </div>
              <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6" aria-hidden="true">
                <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-primary/30 to-secondary/30 opacity-30" />
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-foreground mt-8 mb-8">Collab Now ✨</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Effortless collabs. Real connections.
              </p>
            </div>
            {!collaborations || collaborations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No collaborations available at the moment.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborations.map((collab) => (
                  <Card key={collab.id} className="hover:shadow-lg transition-shadow">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <img
                        src={collab.image_url || "/placeholder.svg"}
                        alt={collab.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">{collab.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{collab.business?.business_name}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{collab.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm">
                          <strong>Requirements:</strong> {collab.requirements.join(", ")}
                        </p>
                        <p className="text-sm">
                          <strong>Compensation:</strong> ${collab.compensation}
                        </p>
                      </div>
                      <Button className="w-full mt-4">Join Collaboration</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default InfluencerDashboard;