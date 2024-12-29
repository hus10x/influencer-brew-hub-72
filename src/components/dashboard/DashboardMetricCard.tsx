import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export const DashboardMetricCard = ({ title, value, subtitle, icon }: DashboardMetricCardProps) => {
  return (
    <Card className="bg-muted/5 backdrop-blur-xl border-border/90 hover:shadow-lg transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:bg-muted/9">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary">{value}</p>
        <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};