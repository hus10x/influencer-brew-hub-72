import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { InstagramConnect } from "@/components/InstagramConnect";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { checkInstagramConnection } from "@/utils/checkInstagramConnection";

interface Collaboration {
  id: string;
  businessName: string;
  description: string;
  requirements: string;
  compensation: string;
  image: string;
}

const mockCollaborations: Collaboration[] = [
  {
    id: "1",
    businessName: "Café Sunshine",
    description: "Share our new summer menu with your followers!",
    requirements: "1 Instagram story with location tag",
    compensation: "Free meal for two",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24",
  },
  {
    id: "2",
    businessName: "Burger Haven",
    description: "Feature our signature burger in your content",
    requirements: "1 Instagram story + tag",
    compensation: "$50 store credit",
    image: "https://images.unsplash.com/photo-1586816001966-79b736744398",
  },
  {
    id: "3",
    businessName: "Sushi Master",
    description: "Showcase our premium sushi experience",
    requirements: "1 Post + 2 Stories",
    compensation: "$100 dining credit",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c",
  },
  {
    id: "4",
    businessName: "Pizza Palace",
    description: "Review our new gourmet pizza line",
    requirements: "1 Reel + 1 Story",
    compensation: "$75 store credit",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591",
  },
  {
    id: "5",
    businessName: "Sweet Treats",
    description: "Feature our dessert collection",
    requirements: "2 Stories + Location Tag",
    compensation: "Free dessert platter",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777",
  },
  {
    id: "6",
    businessName: "Health Bowl",
    description: "Promote our new vegan menu",
    requirements: "1 Post + 1 Story",
    compensation: "$60 store credit",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  },
];

const InfluencerDashboard = () => {
  const { data: profile, isLoading, error } = useQuery({
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

      // Check Instagram connection status
      if (profile?.email) {
        const instagramStatus = await checkInstagramConnection(profile.email);
        console.log('Instagram connection status:', instagramStatus);
      }

      return profile;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <p>Loading...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    toast.error('Failed to load profile');
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 pt-20">
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <p>Something went wrong. Please try again later.</p>
          </div>
        </main>
      </div>
    );
  }

  const isInstagramConnected = profile?.instagram_connected || false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-20">
        {!isInstagramConnected ? (
          <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
            <div className="relative isolate overflow-hidden bg-muted/50 dark:bg-background/95 py-16 sm:py-24 rounded-3xl w-full">
              <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
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
              <h1 className="text-4xl font-bold text-foreground">Collab Now ✨</h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Effortless collabs. Real connections.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCollaborations.map((collab) => (
                <Card key={collab.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative h-48 overflow-hidden rounded-t-lg">
                    <img
                      src={collab.image}
                      alt={collab.businessName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl">{collab.businessName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{collab.description}</p>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Requirements:</strong> {collab.requirements}
                      </p>
                      <p className="text-sm">
                        <strong>Compensation:</strong> {collab.compensation}
                      </p>
                    </div>
                    <Button className="w-full mt-4">Join Collaboration</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InfluencerDashboard;