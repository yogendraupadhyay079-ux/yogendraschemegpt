import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from '../services/notification.service';
import type { Notification } from '../lib/database.types';

export function useNotifications() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const [data, count] = await Promise.all([
      getNotifications(user.id),
      getUnreadCount(user.id),
    ]);
    setNotifications(data);
    setUnreadCount(count);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = useCallback(async (id: string) => {
    await markAsRead(id);
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    await markAllAsRead(user.id);
    loadNotifications();
  }, [user?.id, loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    refresh: loadNotifications,
  };
}
