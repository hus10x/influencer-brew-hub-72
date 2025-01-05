import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2 } from "lucide-react";

interface BusinessFilterProps {
  onBusinessSelect: (businessId: string | null) => void;
  selectedBusinessId: string | null;
}

export const BusinessFilter = ({ onBusinessSelect, selectedBusinessId }: BusinessFilterProps) => {
  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) {
        console.error("Error fetching businesses:", error);
        throw error;
      }

      return data || [];
    },
  });

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedBusinessId || "all"}
        onValueChange={(value) => onBusinessSelect(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by business" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Businesses</SelectItem>
          {businesses.map((business) => (
            <SelectItem key={business.id} value={business.id}>
              {business.business_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};