import { useState } from "react";
import { useInstagramAuth } from "@/hooks/useInstagramAuth";
import { useInstagramConnection } from "@/hooks/useInstagramConnection";
import { ConnectButton } from "./instagram/ConnectButton";
import { supabase } from "@/integrations/supabase/client"; // Import supabase

export const InstagramConnect = () => {
    const { isLoading, initializeInstagramAuth } = useInstagramAuth();
    const { isConnected } = useInstagramConnection();
    const [efLoading, setEfLoading] = useState(false)

    const handleInstagramConnect = async () => {
        setEfLoading(true)
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
                    setEfLoading(false)
                    // Handle error (e.g., display error message)
                    return;
                }

                const { url } = data;
                window.location.href = url; // Redirect to Instagram
            } catch (error) {
                console.error("Error invoking function", error)
                setEfLoading(false)
            }
        }
        setEfLoading(false)
    };

    return (
        <ConnectButton
            isConnected={isConnected}
            isLoading={isLoading || efLoading} // Use isLoading from both places
            onClick={handleInstagramConnect}
        />
    );
};
