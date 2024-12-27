import { Button } from "@/components/ui/button";
import { Instagram, Loader2 } from "lucide-react";

interface ConnectButtonProps {
  isConnected: boolean;
  isLoading: boolean;
  onClick: () => void;
}

export const ConnectButton = ({ isConnected, isLoading, onClick }: ConnectButtonProps) => {
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
      onClick={onClick}
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