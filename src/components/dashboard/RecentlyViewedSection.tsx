import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock, Eye, ArrowUpRight, IndianRupee } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Scheme } from '../../lib/database.types';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

type RecentlyViewedScheme = Scheme & { viewed_at: string };

export function RecentlyViewedSection() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedScheme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('user_schemes')
        .select('*, scheme:schemes(*)')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error loading recently viewed:', error);
        setLoading(false);
        return;
      }

      const schemes = (data || [])
        .filter((item: any) => item.scheme)
        .map((item: any) => ({
          ...item.scheme,
          viewed_at: item.viewed_at,
        })) as RecentlyViewedScheme[];

      setRecentlyViewed(schemes);
      setLoading(false);
    }

    load();
  }, [user?.id]);

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
    <section className="mb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500">
            <Eye className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">
              {t('dashboard.recentlyViewed')}
            </h2>
            <p className="text-sm text-white/50">
              {t('dashboard.recentlyViewedDescription')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : recentlyViewed.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-white/50">No recently viewed schemes</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentlyViewed.map((scheme, index) => (
            <motion.div
              key={scheme.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={`/scheme/${scheme.id}`}
                className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-[#111827]/80 backdrop-blur-xl p-5 transition-all hover:border-blue-500/30 hover:bg-white/5"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20">
                  <Eye className="h-5 w-5 text-blue-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate group-hover:text-cyan-400 transition">
                    {scheme.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <IndianRupee size={12} />
                      {scheme.estimated_benefit}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatTimeAgo(scheme.viewed_at)}
                    </span>
                  </div>
                </div>

                {/* Match */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-bold text-blue-400">{scheme.ai_score}%</span>
                  <ArrowUpRight
                    size={16}
                    className="text-white/30 transition group-hover:text-cyan-400"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
