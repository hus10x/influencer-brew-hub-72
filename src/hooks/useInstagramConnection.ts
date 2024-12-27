import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useInstagramConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkConnectionStatus = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          if (mounted) {
            await supabase.auth.signOut();
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
          }
          return;
        }

        if (!session) {
          console.log('No active session found');
          if (mounted) {
            navigate('/login');
          }
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('instagram_connected')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profileError) {
          console.error('Error checking Instagram connection:', profileError);
          return;
        }

        if (mounted && profile?.instagram_connected) {
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking Instagram connection:', error);
        if (mounted) {
          toast.error('Error checking Instagram connection status');
        }
      }
    };

    checkConnectionStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && mounted) {
        setIsConnected(false);
        navigate('/login');
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { isConnected };
};