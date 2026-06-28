import { motion } from 'framer-motion';
import { Bell, Trash2, CheckCheck, BellOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import NotificationHeader from '../components/notifications/NotificationHeader';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import FloatingAIAssistant from '../components/FloatingAIAssistant';
import { useAuthStore } from '../store/authStore';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notification.service';
import type { Notification } from '../lib/database.types';
import { cn } from '../components/ui/utils';

export function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const data = await getNotifications(user.id);
      setNotifications(data);
      setLoading(false);
    }
    load();
  }, [user?.id]);

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    if (user?.id) {
      const data = await getNotifications(user.id);
      setNotifications(data);
    }
  }

  async function handleMarkAllAsRead() {
    if (!user?.id) return;
    await markAllAsRead(user.id);
    const data = await getNotifications(user.id);
    setNotifications(data);
  }

  async function handleDelete(id: string) {
    await deleteNotification(id);
    if (user?.id) {
      const data = await getNotifications(user.id);
      setNotifications(data);
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeConfig: Record<string, { color: string; bg: string }> = {
    info: { color: 'text-cyan-400', bg: 'bg-cyan-500/20' },
    warning: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
    success: { color: 'text-green-400', bg: 'bg-green-500/20' },
    urgent: { color: 'text-red-400', bg: 'bg-red-500/20' },
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <AnimatedBackground />
      <FloatingParticles />
      <Sidebar />
      <Topbar />

      <main className="ml-[280px] pt-20 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <NotificationHeader />
          </motion.div>

          {/* Action Bar */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 text-sm font-medium text-cyan-400">
                {unreadCount} unread
              </span>
              <span className="text-white/50 text-sm">
                {notifications.length} total notifications
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <CheckCheck size={16} />
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-3xl border border-white/10 bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 mb-6">
                <BellOff className="h-10 w-10 text-white/30" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
              <p className="text-white/50">You're all caught up!</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif, index) => {
                const config = typeConfig[notif.type] || typeConfig.info;
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'group flex items-start gap-4 rounded-3xl border p-6 transition-all',
                      notif.read
                        ? 'border-white/10 bg-[#111827]/60'
                        : 'border-cyan-500/20 bg-[#111827]/80'
                    )}
                  >
                    {/* Icon */}
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', config.bg)}>
                      <Bell className={cn('h-5 w-5', config.color)} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white">{notif.title}</h3>
                        {!notif.read && (
                          <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-white/50">{notif.message}</p>
                      <p className="text-xs text-white/30 mt-2">{formatTimeAgo(notif.created_at)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                      {!notif.read && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="rounded-lg p-2 text-white/50 hover:bg-white/10 hover:text-cyan-400 transition"
                          title="Mark as read"
                        >
                          <CheckCheck size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="rounded-lg p-2 text-white/50 hover:bg-red-500/20 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
}
