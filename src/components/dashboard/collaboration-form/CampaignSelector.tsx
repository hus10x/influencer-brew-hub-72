import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";
import { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CampaignSelectorProps {
  form: UseFormReturn<CollaborationFormData>;
  campaigns?: Tables<"campaigns">[];
}

export const CampaignSelector = ({ form, campaigns }: CampaignSelectorProps) => {
  if (!campaigns || campaigns.length === 0) return null;

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');

  return (
    <FormField
      control={form.control}
      name="campaignId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Campaign</FormLabel>
          <FormControl>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a campaign" />
              </SelectTrigger>
              <SelectContent>
                {activeCampaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};