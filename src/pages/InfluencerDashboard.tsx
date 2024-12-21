import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Instagram, LogOut } from "lucide-react";

interface Collaboration {
  id: string;
  businessName: string;
  description: string;
  requirements: string;
  compensation: string;
}

const mockCollaborations: Collaboration[] = [
  {
    id: "1",
    businessName: "Café Sunshine",
    description: "Share our new summer menu with your followers!",
    requirements: "1 Instagram story with location tag",
    compensation: "Free meal for two",
  },
  {
    id: "2",
    businessName: "Burger Haven",
    description: "Feature our signature burger in your content",
    requirements: "1 Instagram story + tag",
    compensation: "$50 store credit",
  },
];

const InfluencerDashboard = () => {
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Influencer Dashboard</h1>
          <div className="flex items-center gap-4">
            {!isInstagramConnected && (
              <Button
                onClick={() => setIsInstagramConnected(true)}
                className="flex items-center gap-2"
              >
                <Instagram className="w-4 h-4" />
                Connect Instagram
              </Button>
            )}
            <Button variant="outline" className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!isInstagramConnected ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Connect Your Instagram Account</h2>
            <p className="text-gray-600 mb-6">
              To start collaborating with brands, you need to connect your Instagram account first.
            </p>
            <Button
              onClick={() => setIsInstagramConnected(true)}
              className="flex items-center gap-2 mx-auto"
            >
              <Instagram className="w-4 h-4" />
              Connect Instagram
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockCollaborations.map((collab) => (
              <Card key={collab.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{collab.businessName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{collab.description}</p>
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
        )}
      </main>
    </div>
  );
};

export default InfluencerDashboard;