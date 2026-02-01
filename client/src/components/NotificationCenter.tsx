import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Check, CheckCheck, Trash2, Package, AlertTriangle, Info } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  // Query notifications
  const { data: notifications = [], refetch } = trpc.notifications.list.useQuery(
    { limit: 50 },
    { refetchInterval: open ? 5000 : 30000 } // Poll every 5s when open, 30s when closed
  );

  const { data: unreadCount = 0 } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30000, // Poll every 30 seconds
  });

  // Mutations
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      toast.success("All notifications marked as read");
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      toast.success("Notification deleted");
    },
  });

  const handleMarkAsRead = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    markAsReadMutation.mutate({ id });
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteMutation.mutate({ id });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-4 w-4 text-blue-500" />;
      case "low_stock":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case "system":
        return <Info className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-500">
              <Bell className="h-36 w-12 mb-2 opacity-50" />
              <p>No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  {notification.link ? (
                    <Link href={notification.link}>
                      <a
                        className="block"
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsReadMutation.mutate({ id: notification.id });
                          }
                          setOpen(false);
                        }}
                      >
                        <NotificationContent
                          notification={notification}
                          getIcon={getIcon}
                          formatTime={formatTime}
                          onMarkAsRead={handleMarkAsRead}
                          onDelete={handleDelete}
                        />
                      </a>
                    </Link>
                  ) : (
                    <NotificationContent
                      notification={notification}
                      getIcon={getIcon}
                      formatTime={formatTime}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function NotificationContent({
  notification,
  getIcon,
  formatTime,
  onMarkAsRead,
  onDelete,
}: {
  notification: any;
  getIcon: (type: string) => React.ReactNode;
  formatTime: (date: Date) => string;
  onMarkAsRead: (id: number, e: React.MouseEvent) => void;
  onDelete: (id: number, e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex gap-3">
      <div className="mt-1">{getIcon(notification.type)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-sm">{notification.title}</p>
          <span className="text-xs text-gray-500 whitespace-nowrap">
            {formatTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
        <div className="flex items-center gap-2 mt-2">
          {!notification.isRead && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={(e) => onMarkAsRead(notification.id, e)}
            >
              <Check className="h-3 w-3 mr-1" />
              Mark read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-600 hover:text-red-700"
            onClick={(e) => onDelete(notification.id, e)}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
