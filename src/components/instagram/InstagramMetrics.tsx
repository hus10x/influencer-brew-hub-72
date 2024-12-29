import { useInstagramData } from "@/hooks/useInstagramData";
import { DashboardMetricCard } from "@/components/dashboard/DashboardMetricCard";
import { Instagram, Users, Image } from "lucide-react";

export const InstagramMetrics = () => {
  const { data, isLoading } = useInstagramData();

  if (isLoading) {
    return <div>Loading metrics...</div>;
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