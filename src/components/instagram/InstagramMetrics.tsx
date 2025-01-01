import { useInstagramData } from "@/hooks/useInstagramData";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { Instagram, Users, Image, Loader2, TrendingUp } from "lucide-react";

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

  const engagementRate = ((data.user.media_count > 0 ? 
    (data.media.reduce((sum, post) => sum + (post.like_count || 0) + (post.comments_count || 0), 0) / data.user.media_count) 
    : 0) / data.user.followers_count * 100).toFixed(2);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Instagram Insights</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Instagram Followers"
          value={data.user.followers_count.toLocaleString()}
          subtitle={`@${data.user.username}`}
          icon={<Users className="h-4 w-4" />}
        />
        <DashboardMetricCard
          title="Engagement Rate"
          value={`${engagementRate}%`}
          subtitle="Average per post"
          icon={<TrendingUp className="h-4 w-4" />}
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
    </div>
  );
};