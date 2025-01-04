import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface BusinessCardHeaderProps {
  business: Tables<"businesses">;
}

export const BusinessCardHeader = ({ business }: BusinessCardHeaderProps) => {
  // Add console log to debug business data in header
  console.log("Business data in Header:", business);
  
  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={business.logo_url || ""} alt={business.business_name} />
        <AvatarFallback>
          <Building2 className="h-8 w-8 text-muted-foreground" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{business.business_name}</h3>
        {business.industry && (
          <Badge variant="secondary" className="mt-1">
            {business.industry}
          </Badge>
        )}
      </div>
    </div>
  );
};