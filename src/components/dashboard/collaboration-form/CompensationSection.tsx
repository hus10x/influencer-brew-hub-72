import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";

interface CompensationSectionProps {
  form: UseFormReturn<CollaborationFormData>;
}

export const CompensationSection = ({ form }: CompensationSectionProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="compensation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compensation (USD)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter compensation amount"
                {...field}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="deadline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Deadline</FormLabel>
            <FormControl>
              <Input type="datetime-local" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="max_spots"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Number of Spots</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                placeholder="Enter number of available spots"
                {...field}
                onChange={(e) => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};