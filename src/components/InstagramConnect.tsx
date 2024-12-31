import { useState } from "react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const InstagramConnect = () => {
    const { isLoading: authIsLoading, initializeInstagramAuth } = useInstagramAuth();
    const { isConnected } = useInstagramConnection();
    const [efLoading, setEfLoading] = useState(false);

    const handleInstagramConnect = async () => {
        console.log("handleInstagramConnect function called!"); // *** THIS IS THE CRITICAL LINE ***
        setEfLoading(true);
        const session = supabase.auth.session();

        if (!session) {
            console.error("User not authenticated.");
            toast.error("Please log in to connect your Instagram account.");
            setEfLoading(false);
            return;
        }

        try {
            const authData = await initializeInstagramAuth();
            if(!authData) {
                toast.error("Error initializing instagram auth")
                setEfLoading(false)
                return
            }

            await supabase.functions.invoke('instagram-auth/oauth-url', {
                headers: {
                    Authorization: `Bearer ${session.access_token}`,
                },
            });

        } catch (error) {
            console.error("Error invoking function", error);
            toast.error("An unexpected error occurred. Please try again.");
            setEfLoading(false);
        } finally {
            setEfLoading(false);
        }
    };

    return (
        <ConnectButton
            isConnected={isConnected}
            isLoading={authIsLoading || efLoading}
            onClick={handleInstagramConnect}
        />
    );
};
