import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";
import { Tables } from "@/integrations/supabase/types";

interface CampaignSelectorProps {
  form: UseFormReturn<CollaborationFormData>;
  campaigns?: Tables<"campaigns">[];
}

export const CampaignSelector = ({ form, campaigns }: CampaignSelectorProps) => {
  if (!campaigns || campaigns.length === 0) return null;

  return (
    <FormField
      control={form.control}
      name="campaign_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Campaign</FormLabel>
          <FormControl>
            <select className="w-full p-2 border rounded-md" {...field}>
              <option value="">Select a campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
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