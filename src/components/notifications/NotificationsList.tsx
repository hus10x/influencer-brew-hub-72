import { Tables } from "@/integrations/supabase/types";
import { useNotifications } from "@/hooks/useNotifications";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationsList = () => {
  const { notifications, isLoading, markAsRead } = useNotifications();

  if (isLoading) {
    return <div className="p-4 text-center">Loading notifications...</div>;
  }

  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No notifications yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full">
      <div className="space-y-2 p-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              "p-4 rounded-lg border relative cursor-pointer transition-colors",
              notification.read ? "bg-muted/50" : "bg-card hover:bg-accent/10"
            )}
            onClick={() => !notification.read && markAsRead(notification.id)}
          >
            {!notification.read && (
              <Circle className="w-2 h-2 absolute top-4 right-4 fill-primary text-primary" />
            )}
            <h4 className="font-medium mb-1">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(notification.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};