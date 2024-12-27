import { InstagramButton } from "./InstagramButton";
import { useInstagramConnection } from "./useInstagramConnection";

export const InstagramConnect = () => {
  const { isLoading, isConnected, handleInstagramConnect } = useInstagramConnection();

  return (
    <InstagramButton
      isConnected={isConnected}
      isLoading={isLoading}
      onClick={handleInstagramConnect}
    />
  );
};