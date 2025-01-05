import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { CollaborationFormData } from "./types";
import { Tables } from "@/integrations/supabase/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
        (payload) => {
          console.log('Campaign change detected:', payload);
          // Invalidate and refetch campaigns query
          queryClient.invalidateQueries({ queryKey: ['campaigns'] });
          
          // Show toast notification based on the event type
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New campaign created');
              break;
            case 'UPDATE':
              toast.info('Campaign updated');
              break;
            case 'DELETE':
              toast.info('Campaign removed');
              // If the deleted campaign was selected, reset the form value
              if (form.getValues('campaignId') === payload.old.id) {
                form.setValue('campaignId', '');
              }
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to campaign changes');
        }
      });

    // Cleanup subscription
    return () => {
      console.log('Cleaning up campaign subscription');
      supabase.removeChannel(channel);
    };
  }, [queryClient, form]);

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