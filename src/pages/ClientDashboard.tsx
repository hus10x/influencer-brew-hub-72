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

  // Unified campaigns query
  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", userData.user.id);

      if (!businesses?.length) return [];

      const businessIds = businesses.map(b => b.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .in("business_id", businessIds);

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }

      return data || [];
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 10, // Keep unused data in cache for 10 minutes
  });

  // Filter active campaigns for QuickActions
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');

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
              <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">
                Manage Your Campaigns
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                Drag and drop campaigns between columns to update their status
              </p>
            </div>
            <QuickActions campaigns={activeCampaigns} />
            <KanbanBoard campaigns={campaigns} />
          </div>
        );
      case "overview":
      default:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">
                Overview
              </h1>
              <p className="text-muted-foreground dark:text-muted-foreground/90">
                View how campaigns and collaborations impact your business
              </p>
            </div>
            <QuickActions campaigns={activeCampaigns} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <DashboardMetricCard
                title="ROI Budget"
                value="BHD 2,500"
                subtitle="Monthly budget"
              />
              <DashboardMetricCard
                title="Live Campaigns"
                value={activeCampaigns.length.toString()}
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