import { Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface BusinessFilterProps {
  onFilterChange: (selectedBusinessIds: string[]) => void;
}

export const BusinessFilter = ({ onFilterChange }: BusinessFilterProps) => {
  const [open, setOpen] = useState(false);
  const [selectedBusinesses, setSelectedBusinesses] = useState<string[]>([]);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["businesses"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", userData.user.id);

      if (error) throw error;
      return data;
    },
  });

  const handleSelect = (businessId: string) => {
    const updatedSelection = selectedBusinesses.includes(businessId)
      ? selectedBusinesses.filter(id => id !== businessId)
      : [...selectedBusinesses, businessId];
    
    setSelectedBusinesses(updatedSelection);
    onFilterChange(updatedSelection);
  };

  const clearFilters = () => {
    setSelectedBusinesses([]);
    onFilterChange([]);
  };

  if (businesses.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-dashed"
          >
            {selectedBusinesses.length > 0 ? (
              <>
                {selectedBusinesses.length} business{selectedBusinesses.length > 1 ? 'es' : ''} selected
              </>
            ) : (
              <>Filter by business</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search businesses..." />
            <CommandEmpty>No businesses found.</CommandEmpty>
            <CommandGroup>
              {businesses.map((business) => (
                <CommandItem
                  key={business.id}
                  onSelect={() => handleSelect(business.id)}
                  className="flex items-center gap-2"
                >
                  <div
                    className={cn(
                      "flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedBusinesses.includes(business.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <span>{business.business_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedBusinesses.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
        >
          Clear filters
        </Button>
      )}
    </div>
  );
};