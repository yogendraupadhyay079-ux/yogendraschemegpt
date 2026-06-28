import { motion } from 'framer-motion';
import { Settings } from 'lucide-react';
import SettingsHeader from '../components/settings/SettingsHeader';
import AccountSettingsCard from '../components/settings/AccountSettingsCard';
import LanguageCard from '../components/settings/LanguageCard';
import PrivacyCard from '../components/settings/PrivacyCard';
import VoiceSettingsCard from '../components/settings/VoiceSettingsCard';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import FloatingAIAssistant from '../components/FloatingAIAssistant';

export function SettingsPage() {
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
                <Settings className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-white/50">Manage your account preferences</p>
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <SettingsHeader />
            <AccountSettingsCard />
            <LanguageCard />
            <VoiceSettingsCard />
            <PrivacyCard />
          </div>
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
}
