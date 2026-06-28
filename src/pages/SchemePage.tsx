import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import SchemeResultsPage from '../components/scheme/SchemeResultsPage';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import FloatingAIAssistant from '../components/FloatingAIAssistant';

export function SchemePage() {
  const { t } = useTranslation();

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
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{t('nav.schemes')}</h1>
                <p className="text-white/50">Browse all available government schemes</p>
              </div>
            </div>
          </motion.div>

          <SchemeResultsPage />
        </div>
      </main>

      <FloatingAIAssistant />
    </div>
  );
}
