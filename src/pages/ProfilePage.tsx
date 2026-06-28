import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import ProfileHeader from '../components/profile/ProfileHeader';
import PersonalInfoCard from '../components/profile/PersonalInfoCard';
import ProfileForm from '../components/profile/ProfileForm';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import FloatingAIAssistant from '../components/FloatingAIAssistant';
import { useAuthStore } from '../store/authStore';
import { getProfile } from '../services/profile.service';
import type { Profile } from '../lib/database.types';

export function ProfilePage() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      const p = await getProfile(user.id);
      setProfile(p);
      setLoading(false);
    }
    load();
  }, [user?.id]);

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
            <div className="flex items-center gap-4 mb-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500">
                <User className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">My Profile</h1>
                <p className="text-white/50">Manage your welfare profile and personal details</p>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="space-y-6">
              <div className="h-32 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
              <div className="h-64 rounded-3xl border border-white/10 bg-white/5 animate-pulse" />
            </div>
          ) : (
            <>
              {profile ? (
                <div className="space-y-6">
                  <ProfileHeader profile={profile} />
                  <PersonalInfoCard profile={profile} />
                </div>
              ) : null}

              <div className="mt-6">
                <ProfileForm />
              </div>
            </>
          )}
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
}
