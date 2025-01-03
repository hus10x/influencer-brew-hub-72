import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityItem {
  id: number;
  name: string;
  description: string;
  timeAgo: string;
}

export const RecentActivityCard = () => {
  const activities: ActivityItem[] = [
    { id: 1, name: "@foodie_influencer_1", description: "Completed campaign for Summer Menu", timeAgo: "2 days ago" },
    { id: 2, name: "@foodie_influencer_2", description: "Completed campaign for Summer Menu", timeAgo: "2 days ago" },
    { id: 3, name: "@foodie_influencer_3", description: "Completed campaign for Summer Menu", timeAgo: "2 days ago" },
  ];

  return (
    <Card className="mt-8 bg-card text-card-foreground backdrop-blur-xl border-border/90 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:bg-muted/9 transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-xl font-medium text-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="flex items-center justify-between p-4 rounded-lg border border-border/90 bg-card text-card-foreground backdrop-blur-xl hover:shadow-lg transition-all duration-200 hover:bg-muted/9"
            >
              <div>
                <p className="font-medium text-foreground">{activity.name}</p>
                <p className="text-sm text-foreground/70">{activity.description}</p>
              </div>
              <span className="text-sm text-foreground/70">{activity.timeAgo}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};