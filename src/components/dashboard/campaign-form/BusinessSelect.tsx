import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CampaignFormData } from "./types";
import { Tables } from "@/integrations/supabase/types";

interface BusinessSelectProps {
  form: UseFormReturn<CampaignFormData>;
  businesses: Tables<"businesses">[];
}

export const BusinessSelect = ({ form, businesses }: BusinessSelectProps) => {
  return (
    <FormField
      control={form.control}
      name="business_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Business</FormLabel>
          <FormControl>
            <select 
              className="w-full p-2 border rounded-md dark:bg-card dark:border-input dark:text-foreground" 
              {...field}
            >
              <option value="">Select a business</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.business_name}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};