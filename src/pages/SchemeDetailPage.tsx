import { useParams } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar2';
import { Topbar } from '../components/layout/Topbar2';
import { AnimatedBackground } from '../components/ui/AnimatedBackground';
import { FloatingParticles } from '../components/ui/FloatingParticles';
import SchemeDetails from '../components/scheme/SchemeDetails';

export function SchemeDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white">
      <AnimatedBackground />
      <FloatingParticles />
      <Sidebar />
      <Topbar />

      <main className="ml-[280px] pt-20 px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <SchemeDetails id={id} />
        </div>
      </main>
    </div>
  );
}
