import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBadge = () => {
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (unreadCount === 0) return null;

  return (
    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
      {unreadCount}
    </div>
  );
};