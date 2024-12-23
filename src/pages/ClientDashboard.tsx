import { useState } from "react";
import {
  BarChart3,
  FileText,
  Settings,
  Store,
  Users,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BusinessList } from "@/components/business/BusinessList";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "campaigns", label: "Campaigns", icon: PlusCircle },
    { id: "businesses", label: "Manage Business", icon: Store },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "influencers", label: "Influencers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "businesses":
        return <BusinessList />;
      case "overview":
      default:
        return (
          <div className="space-y-6">
            <QuickActions />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardMetricCard
                title="ROI Budget"
                value="$2,500"
                subtitle="Monthly budget"
              />
              <DashboardMetricCard
                title="Live Campaigns"
                value="4"
                subtitle="Active collaborations"
              />
              <DashboardMetricCard
                title="Total Reach"
                value="25.4K"
                subtitle="Audience reached"
              />
            </div>
            <RecentActivityCard />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <DashboardSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarItems={sidebarItems}
      />

      <main className="flex-1 p-8 bg-background/60 backdrop-blur-xl">
        {renderContent()}
      </main>
    </div>
  );
};

export default ClientDashboard;