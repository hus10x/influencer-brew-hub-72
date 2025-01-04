import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCountAnimation } from "@/hooks/use-count-animation";

interface DashboardMetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ReactNode;
}

export const DashboardMetricCard = ({ title, value, subtitle, icon }: DashboardMetricCardProps) => {
  // Extract numeric value and currency/suffix if present
  const numericString = value.replace(/[^0-9.]/g, "");
  const numericValue = parseFloat(numericString);
  const prefix = value.match(/^[^\d]*/)?.[0] || "";
  const suffix = value.match(/[^\d]*$/)?.[0] || "";
  const hasDecimal = value.includes(".");
  const decimalPlaces = hasDecimal ? numericString.split(".")[1]?.length || 0 : 0;
  
  const animatedValue = useCountAnimation(numericValue * (decimalPlaces ? Math.pow(10, decimalPlaces) : 1));
  
  const formattedValue = hasDecimal
    ? (animatedValue / Math.pow(10, decimalPlaces)).toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      })
    : animatedValue.toLocaleString();
  
  return (
    <Card className="bg-card text-card-foreground backdrop-blur-xl border-border/90 hover:shadow-lg transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:bg-muted/9">
      <CardHeader className="space-y-1">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-primary animate-fade-in">
          {prefix}{formattedValue}{suffix}
        </p>
        <p className="text-sm text-foreground/70 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
};