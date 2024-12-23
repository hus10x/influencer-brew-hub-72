import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      console.log('Simulating Instagram connection for development...');
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Update the user's profile with mock Instagram data
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          instagram_handle: 'dev_' + user.id.substring(0, 8),
          instagram_connected: true,
          instagram_business_account: true,
          instagram_access_token: 'mock_token_' + Date.now(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      toast.success('Successfully connected to Instagram (Development Mode)');
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error in development Instagram connection:', error);
      toast.error('Failed to connect to Instagram. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleInstagramConnect}
      disabled={isLoading}
      className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 hover:bg-primary/90"
      size="lg"
    >
      <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
      {isLoading ? 'Connecting...' : 'Connect Instagram (Dev Mode)'}
      <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
    </Button>
  );
};