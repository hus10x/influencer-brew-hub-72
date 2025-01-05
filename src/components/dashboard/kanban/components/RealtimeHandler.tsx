import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface RealtimeHandlerProps {
  onCampaignUpdate?: () => void;
  onCollaborationUpdate?: () => void;
}

export const RealtimeHandler = ({
  onCampaignUpdate,
  onCollaborationUpdate,
}: RealtimeHandlerProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    
    const campaignChannel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns'
        },
        async (payload) => {
          console.log('Campaign change detected:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New campaign created');
              break;
            case 'DELETE':
              toast.info('Campaign deleted');
              break;
            case 'UPDATE':
              const oldStatus = payload.old?.status;
              const newStatus = payload.new?.status;
              
              if (oldStatus !== newStatus) {
                toast.info(`Campaign status updated to ${newStatus}`);
              }
              break;
          }
          
          onCampaignUpdate?.();
          await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        }
      )
      .subscribe();

    const collabChannel = supabase
      .channel('collab-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'collaborations'
        },
        async (payload) => {
          console.log('Collaboration change detected:', payload);
          
          switch (payload.eventType) {
            case 'INSERT':
              toast.success('New collaboration added');
              break;
            case 'DELETE':
              toast.info('Collaboration removed');
              break;
            case 'UPDATE':
              if (payload.new?.status !== payload.old?.status) {
                toast.info(`Collaboration status updated to ${payload.new?.status}`);
              }
              break;
          }
          
          onCollaborationUpdate?.();
          await queryClient.invalidateQueries({ queryKey: ["campaigns"] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions...');
      supabase.removeChannel(campaignChannel);
      supabase.removeChannel(collabChannel);
    };
  }, [onCampaignUpdate, onCollaborationUpdate, queryClient]);

  return null;
};