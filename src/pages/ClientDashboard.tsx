import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Instagram,
  LogOut,
  PlusCircle,
  Building2,
  BarChart3,
  Settings,
} from "lucide-react";

const ClientDashboard = () => {
  const [isInstagramConnected, setIsInstagramConnected] = useState(false);

  const menuItems = [
    {
      icon: PlusCircle,
      title: "Create Collaboration",
      description: "Start a new influencer campaign",
    },
    {
      icon: Building2,
      title: "Manage Business",
      description: "Update your business details",
    },
    {
      icon: BarChart3,
      title: "Metrics",
      description: "View campaign performance",
    },
    {
      icon: Settings,
      title: "Settings",
      description: "Manage your account",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
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
              To start creating collaborations, you need to connect your Instagram account first.
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <Card
                key={item.title}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <item.icon className="w-8 h-8 text-accent mb-2" />
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;