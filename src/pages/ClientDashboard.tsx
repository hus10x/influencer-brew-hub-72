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

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "businesses", label: "Manage Business", icon: Store },
    { id: "collaborations", label: "Create Collaboration", icon: PlusCircle },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "influencers", label: "Influencers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Hikayat</h1>
        </div>
        <nav className="px-4 py-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activeTab === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <Button variant="outline" className="w-full mt-4 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ROI Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">$2,500</p>
              <p className="text-sm text-gray-600 mt-1">Monthly budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">4</p>
              <p className="text-sm text-gray-600 mt-1">Active collaborations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">25.4K</p>
              <p className="text-sm text-gray-600 mt-1">Audience reached</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">@foodie_influencer_{i}</p>
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