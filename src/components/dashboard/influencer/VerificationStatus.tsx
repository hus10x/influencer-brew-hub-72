import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

interface VerificationStatusProps {
  status: string;
}

export const VerificationStatus = ({ status }: VerificationStatusProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "verified":
        return {
          label: "Verified",
          variant: "success" as const,
          icon: CheckCircle2
        };
      case "rejected":
        return {
          label: "Rejected",
          variant: "destructive" as const,
          icon: XCircle
        };
      default:
        return {
          label: "Pending",
          variant: "secondary" as const,
          icon: Clock
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge variant={config.variant} className="gap-1">
      <config.icon className="h-3 w-3" />
      <span>{config.label}</span>
    </Badge>
  );
};