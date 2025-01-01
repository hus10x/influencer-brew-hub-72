import { useInstagramData } from "@/hooks/useInstagramData";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { Instagram, Users, Image, Loader2 } from "lucide-react";

export const InstagramMetrics = () => {
  const { data, isLoading, error } = useInstagramData();

  if (error) {
    return (
      <div className="text-center text-muted-foreground">
        Failed to load Instagram metrics. Please try again later.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <DashboardMetricCard
        title="Instagram Followers"
        value={data.user.followers_count.toLocaleString()}
        subtitle={`@${data.user.username}`}
        icon={<Users className="h-4 w-4" />}
      />
      <DashboardMetricCard
        title="Total Posts"
        value={data.user.media_count.toLocaleString()}
        subtitle="All time posts"
        icon={<Image className="h-4 w-4" />}
      />
      <DashboardMetricCard
        title="Recent Media"
        value={data.media.length.toString()}
        subtitle="Latest content"
        icon={<Instagram className="h-4 w-4" />}
      />
    </div>
  );
};