import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

interface Business {
  id: string;
  business_name: string;
}

interface BusinessFilterProps {
  onBusinessSelect: (businessId: string) => void;
  selectedBusinessId: string | null;
}

export const BusinessFilter = ({ onBusinessSelect, selectedBusinessId }: BusinessFilterProps) => {
  const { data: businesses = [], isLoading, error } = useQuery({
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

      return data as Business[] || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-10 w-[200px]" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-[300px]">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load businesses. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedBusinessId || "all"}
        onValueChange={onBusinessSelect}
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