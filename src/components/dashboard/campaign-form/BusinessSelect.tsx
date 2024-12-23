import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Business } from "./types";

interface BusinessSelectProps {
  form: UseFormReturn<any>;
  businesses: Business[];
}

export const BusinessSelect = ({ form, businesses }: BusinessSelectProps) => {
  if (businesses.length === 1) {
    return (
      <input
        type="hidden"
        {...form.register("business_id")}
        value={businesses[0].id}
      />
    );
  }

  return (
    <FormField
      control={form.control}
      name="business_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Business</FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a business" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {businesses.map((business) => (
                <SelectItem key={business.id} value={business.id}>
                  {business.business_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};