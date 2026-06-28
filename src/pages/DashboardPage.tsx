import { useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { AIRecommendationsSection } from '../components/dashboard/AIRecommendationsSection';
import { TrendingSchemesSection } from '../components/dashboard/TrendingSchemesSection';
import { DeadlineAlertsSection } from '../components/dashboard/DeadlineAlertsSection';
import { RecentlyViewedSection } from '../components/dashboard/RecentlyViewedSection';
import { useAuthStore } from '../store/authStore';
import { useEligibility } from '../hooks/useEligibility';
import { getUnreadCount } from '../services/notification.service';

export function DashboardPage() {
  const { user } = useAuthStore();
  const { result: eligibility } = useEligibility();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const count = await getUnreadCount(user.id);
        setUnreadCount(count);
      }
    }
    load();
  }, [user?.id]);

  const heroStats = eligibility
    ? {
        aiMatchScore: eligibility.priorityScore,
        totalBenefits: `${eligibility.eligible.length * 50000}`,
        eligibleSchemes: eligibility.eligible.length,
        appliedSchemes: 0,
        pendingApplications: 0,
        recentNotifications: unreadCount,
      }
    : undefined;

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <AnimatedBackground />
      <FloatingParticles count={40} />
      <Sidebar />
      <div className="ml-[280px]">
        <Topbar />
        <main className="relative z-10 px-8 py-24">
          <DashboardHero stats={heroStats} />
          <AIRecommendationsSection />
          <TrendingSchemesSection />
          <DeadlineAlertsSection />
          <RecentlyViewedSection />
        </main>
      </div>
    </div>
  );
}
