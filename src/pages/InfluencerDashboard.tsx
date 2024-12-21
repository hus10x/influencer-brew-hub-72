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
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Collab Now ✨</h1>
            <p className="text-gray-600 mt-1">Find your next exciting collaboration</p>
          </div>
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