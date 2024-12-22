import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Settings,
  Store,
  Users,
  LogOut,
  PlusCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "businesses", label: "Manage Business", icon: Store },
    { id: "collaborations", label: "Create Collaboration", icon: PlusCircle },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "influencers", label: "Influencers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary">Hikayat</h1>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <Button 
            variant="outline" 
            className="w-full mt-4 flex items-center gap-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-medium">ROI Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">$2,500</p>
              <p className="text-sm text-gray-600 mt-1">Monthly budget</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-medium">Live Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">4</p>
              <p className="text-sm text-gray-600 mt-1">Active collaborations</p>
            </CardContent>
          </Card>
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-lg font-medium">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">25.4K</p>
              <p className="text-sm text-gray-600 mt-1">Audience reached</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-medium">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">@foodie_influencer_{i}</p>
                    <p className="text-sm text-gray-600">Completed campaign for Summer Menu</p>
                  </div>
                  <span className="text-sm text-gray-500">2 days ago</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ClientDashboard;