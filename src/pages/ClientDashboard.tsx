import { useState, useEffect } from "react";
import {
  BarChart3,
  FileText,
  Settings,
  Store,
  Users,
  PlusCircle,
  LayoutDashboard,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { RecentActivityCard } from "@/components/dashboard/RecentActivityCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { BusinessList } from "@/components/business/BusinessList";
import { KanbanBoard } from "@/components/dashboard/KanbanBoard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  // Set up real-time subscription for campaign changes
  useEffect(() => {
    console.log('Setting up campaign subscription...');
    
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'campaigns'
        },
        (payload) => {
          console.log('Campaign change detected:', payload);
          // Invalidate and refetch campaigns query
          queryClient.invalidateQueries({ queryKey: ["campaigns"] });
          queryClient.invalidateQueries({ queryKey: ["active-campaigns"] });
          
          // Show toast notification based on the event type
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New campaign created');
              break;
            case 'UPDATE':
              if (payload.new.status !== payload.old.status) {
                toast.info(`Campaign status updated to ${payload.new.status}`);
              } else {
                toast.info('Campaign updated');
              }
              break;
            case 'DELETE':
              toast.info('Campaign removed');
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to campaign changes');
        }
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up campaign subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

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