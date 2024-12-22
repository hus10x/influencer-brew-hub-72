import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const InstagramConnect = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleInstagramConnect = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('instagram-auth');
      
      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error connecting to Instagram:', error);
      toast.error('Failed to connect to Instagram');
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
      {isLoading ? 'Connecting...' : 'Connect Instagram'}
      <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
    </Button>
  );
};