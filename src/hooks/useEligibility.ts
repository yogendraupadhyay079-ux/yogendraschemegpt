import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { checkEligibility } from '../services/eligibility.service';
import { getProfile } from '../services/profile.service';
import { getFamilyMembers } from '../services/family.service';
import type { EligibilityResult } from '../services/eligibility.service';

export function useEligibility() {
  const { user } = useAuthStore();
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      const profile = await getProfile(user.id);
      if (!profile) {
        setLoading(false);
        return;
      }

      const members = await getFamilyMembers();
      const eligibility = await checkEligibility(profile, members);
      setResult(eligibility);
      setLoading(false);
    }

    load();
  }, [user?.id]);

  return { result, loading };
}
