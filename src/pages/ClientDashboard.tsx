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
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { Skeleton } from "@/components/ui/skeleton";

const OverviewSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-9 w-48" />
      <Skeleton className="h-5 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-lg border bg-card">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ))}
    </div>
    <div className="mt-8">
      <div className="rounded-lg border bg-card">
        <div className="p-6 space-y-6">
          <Skeleton className="h-6 w-40" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-60" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading for demo purposes
  useState(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  });

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "campaigns", label: "Campaigns", icon: PlusCircle },
    { id: "businesses", label: "Manage Business", icon: Store },
    { id: "metrics", label: "Metrics", icon: BarChart3 },
    { id: "influencers", label: "Influencers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    if (isLoading && activeTab === "overview") {
      return <OverviewSkeleton />;
    }

    switch (activeTab) {
      case "businesses":
        return <BusinessList />;
      case "campaigns":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">Manage Your Campaigns</h1>
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                Drag and drop campaigns between columns to update their status
              </p>
            </div>
            <QuickActions />
            <KanbanBoard />
          </div>
        );
      case "overview":
      default:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">Overview</h1>
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                View how campaigns and collaborations impact your business
              </p>
            </div>
            <QuickActions />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardMetricCard
                title="ROI Budget"
                value="BHD 2,500"
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