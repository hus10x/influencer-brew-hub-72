import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";
import { useInstagramAuth } from '@/hooks/useInstagramAuth';
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface ConnectButtonProps {
    isConnected: boolean;
}

export const ConnectButton = ({ isConnected }: ConnectButtonProps) => {
    const { initializeInstagramAuth } = useInstagramAuth();
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true); // Set loading state before starting the process
        const authData = await initializeInstagramAuth();

        if (authData) {
            try {
                const { data, error } = await supabase.functions.invoke('instagram-auth/oauth-url', {
                    headers: {
                        Authorization: `Bearer ${supabase.auth.session()?.access_token}`,
                    },
                });

                if (error) {
                    console.error('Error calling Edge Function:', error);
                    // Handle error (e.g., display error message)
                    setIsLoading(false); // Reset loading state on error
                    return;
                }

                const { url } = data;
                window.location.href = url; // Redirect to Instagram
            } catch (error) {
                console.error("Error invoking function", error)
                setIsLoading(false); // Reset loading state on error
            }
        }
        setIsLoading(false);
    };

    if (isConnected) {
        return (
            <Button
                disabled
                className="group relative flex items-center gap-2 overflow-hidden px-6 bg-green-500 hover:bg-green-600"
                size="lg"
            >
                <Instagram className="w-5 h-5" />
                Connected to Instagram
            </Button>
        );
    }

    return (
        <Button
            onClick={handleClick}
            disabled={isLoading}
            className="group relative flex items-center gap-2 overflow-hidden px-6 transition-all duration-300 hover:bg-primary/90"
            size="lg"
        >
            {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
            )}
            {isLoading ? 'Connecting...' : 'Connect Instagram'}
            <span className="absolute -right-8 -top-8 aspect-square w-16 translate-x-full translate-y-full rounded-full bg-white/20 transition-transform group-hover:translate-x-0 group-hover:translate-y-0" />
        </Button>
    );
};

export default ConnectButton;
