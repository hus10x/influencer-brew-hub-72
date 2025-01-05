import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";
import { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface CampaignSelectorProps {
  form: UseFormReturn<CollaborationFormData>;
  campaigns?: Tables<"campaigns">[];
}

export const CampaignSelector = ({ form, campaigns }: CampaignSelectorProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to real-time updates for campaigns
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'campaigns'
        },
        () => {
          // Invalidate and refetch campaigns query
          queryClient.invalidateQueries({ queryKey: ['campaigns'] });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  if (!campaigns || campaigns.length === 0) return null;

  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');

  if (activeCampaigns.length === 0) return null;

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