import { supabase } from '../lib/supabase';
import type { Scheme, Profile, FamilyMember } from '../lib/database.types';

export interface EligibilityResult {
  eligible: EligibleScheme[];
  almostEligible: AlmostEligibleScheme[];
  missingDocuments: MissingDocumentScheme[];
  recommended: EligibleScheme[];
  priorityScore: number;
  confidence: number;
  totalSchemesChecked: number;
}

export interface EligibleScheme {
  scheme: Scheme;
  matchScore: number;
  confidence: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AlmostEligibleScheme {
  scheme: Scheme;
  matchScore: number;
  confidence: number;
  reason: string;
  missingCriteria: string[];
  canFix: boolean;
}

export interface MissingDocumentScheme {
  scheme: Scheme;
  matchScore: number;
  confidence: number;
  reason: string;
  missingDocuments: string[];
}

export async function checkEligibility(
  profile: Profile,
  familyMembers: FamilyMember[] = []
): Promise<EligibilityResult> {
  const { data: schemes, error } = await supabase
    .from('schemes')
    .select('*')
    .neq('status', 'Closed');

  if (error || !schemes) {
    return {
      eligible: [],
      almostEligible: [],
      missingDocuments: [],
      recommended: [],
      priorityScore: 0,
      confidence: 0,
      totalSchemesChecked: 0,
    };
  }

  const eligible: EligibleScheme[] = [];
  const almostEligible: AlmostEligibleScheme[] = [];
  const missingDocuments: MissingDocumentScheme[] = [];

  for (const scheme of schemes) {
    const result = evaluateScheme(scheme, profile, familyMembers);

    if (result.category === 'eligible') {
      eligible.push({
        scheme,
        matchScore: result.matchScore,
        confidence: result.confidence,
        reason: result.reason,
        priority: result.priority,
      });
    } else if (result.category === 'almost') {
      almostEligible.push({
        scheme,
        matchScore: result.matchScore,
        confidence: result.confidence,
        reason: result.reason,
        missingCriteria: result.missingCriteria,
        canFix: result.canFix,
      });
    } else if (result.category === 'missing_docs') {
      missingDocuments.push({
        scheme,
        matchScore: result.matchScore,
        confidence: result.confidence,
        reason: result.reason,
        missingDocuments: result.missingDocuments,
      });
    }
  }

  eligible.sort((a, b) => b.matchScore - a.matchScore);
  almostEligible.sort((a, b) => b.matchScore - a.matchScore);
  missingDocuments.sort((a, b) => b.matchScore - a.matchScore);

  const recommended = eligible.slice(0, 5);

  const priorityScore = calculatePriorityScore(eligible, almostEligible);
  const confidence = calculateConfidence(schemes.length, eligible.length, almostEligible.length);

  return {
    eligible,
    almostEligible,
    missingDocuments,
    recommended,
    priorityScore,
    confidence,
    totalSchemesChecked: schemes.length,
  };
}

interface SchemeEvaluation {
  category: 'eligible' | 'almost' | 'missing_docs' | 'not_eligible';
  matchScore: number;
  confidence: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  missingCriteria: string[];
  canFix: boolean;
  missingDocuments: string[];
}

function evaluateScheme(
  scheme: Scheme,
  profile: Profile,
  familyMembers: FamilyMember[]
): SchemeEvaluation {
  let score = 0;
  let maxScore = 0;
  const missingCriteria: string[] = [];
  const reasons: string[] = [];

  const category = scheme.category.toLowerCase();

  if (category.includes('education') || category.includes('scholar')) {
    maxScore += 30;
    if (profile.student) {
      score += 30;
      reasons.push('You are a student');
    } else {
      const studentMember = familyMembers.find(m => m.student);
      if (studentMember) {
        score += 25;
        reasons.push(`Your family member ${studentMember.name} is a student`);
      } else {
        missingCriteria.push('Must be a student');
      }
    }
  } else if (category.includes('agri') || category.includes('farmer')) {
    maxScore += 30;
    if (profile.farmer) {
      score += 30;
      reasons.push('You are a farmer');
    } else {
      const farmerMember = familyMembers.find(m => m.farmer);
      if (farmerMember) {
        score += 25;
        reasons.push(`Your family member ${farmerMember.name} is a farmer`);
      } else {
        missingCriteria.push('Must be a farmer');
      }
    }
  } else if (category.includes('business') || category.includes('startup') || category.includes('msme')) {
    maxScore += 30;
    if (profile.startup_founder || profile.msme) {
      score += 30;
      reasons.push('You are a business owner');
    } else {
      missingCriteria.push('Must be a business owner or startup founder');
    }
  } else if (category.includes('senior') || category.includes('pension')) {
    maxScore += 30;
    if (profile.senior_citizen || profile.age >= 60) {
      score += 30;
      reasons.push('You are a senior citizen');
    } else {
      const seniorMember = familyMembers.find(m => m.age >= 60);
      if (seniorMember) {
        score += 25;
        reasons.push(`Your family member ${seniorMember.name} is a senior citizen`);
      } else {
        missingCriteria.push('Must be 60 years or above');
      }
    }
  } else if (category.includes('women') || category.includes('widow')) {
    maxScore += 30;
    if (profile.women || profile.gender === 'Female' || profile.widow) {
      score += 30;
      reasons.push(profile.widow ? 'You are a widow' : 'You are eligible as a woman');
    } else {
      const womenMember = familyMembers.find(m => m.gender === 'Female' || m.widow);
      if (womenMember) {
        score += 25;
        reasons.push(`Your family member ${womenMember.name} is eligible`);
      } else {
        missingCriteria.push('Must be a woman or widow');
      }
    }
  } else if (category.includes('insurance') || category.includes('health')) {
    maxScore += 30;
    score += 25;
    reasons.push('Health/insurance schemes are generally available to all citizens');
  } else if (category.includes('housing')) {
    maxScore += 30;
    if (profile.annual_income <= 1800000) {
      score += 30;
      reasons.push('Your income qualifies for housing assistance');
    } else {
      missingCriteria.push('Annual income must be below ₹18 lakhs');
    }
  } else {
    maxScore += 20;
    score += 15;
    reasons.push('This scheme is available for your demographic');
  }

  maxScore += 20;
  if (profile.annual_income > 0) {
    const incomeLimit = getIncomeLimit(scheme);
    if (profile.annual_income <= incomeLimit) {
      score += 20;
      reasons.push('Your income is within the eligible range');
    } else {
      missingCriteria.push(`Annual income must be below ₹${incomeLimit.toLocaleString()}`);
      score += 5;
    }
  } else {
    score += 10;
  }

  maxScore += 15;
  if (profile.state && profile.district) {
    score += 15;
  } else {
    missingCriteria.push('Please update your state and district');
    score += 5;
  }

  maxScore += 15;
  if (profile.category) {
    const schemeCategoryMatch = checkCategoryMatch(scheme, profile);
    if (schemeCategoryMatch) {
      score += 15;
      reasons.push('Your category matches the scheme requirements');
    } else {
      score += 8;
    }
  } else {
    score += 5;
  }

  maxScore += 20;
  const profileDocs = getProfileDocuments(profile);
  const schemeDocs = scheme.documents_required || [];
  const missingDocs = schemeDocs.filter(doc => !profileDocs.includes(doc));
  if (missingDocs.length === 0) {
    score += 20;
  } else if (missingDocs.length <= 2) {
    score += 10;
  } else {
    score += 3;
  }

  const matchScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const confidence = Math.min(100, Math.max(50, matchScore + (reasons.length * 5)));

  const reason = reasons.length > 0
    ? reasons.join('. ')
    : 'This scheme matches your profile based on your demographic information.';

  let category_result: SchemeEvaluation['category'] = 'not_eligible';
  let priority: 'high' | 'medium' | 'low' = 'low';
  let canFix = false;

  if (missingCriteria.length === 0 && missingDocs.length === 0) {
    category_result = 'eligible';
    priority = matchScore >= 80 ? 'high' : matchScore >= 60 ? 'medium' : 'low';
  } else if (missingDocs.length > 0 && missingCriteria.length === 0) {
    category_result = 'missing_docs';
    priority = matchScore >= 70 ? 'high' : 'medium';
    canFix = true;
  } else if (missingCriteria.length <= 2) {
    category_result = 'almost';
    canFix = missingCriteria.some(c =>
      c.includes('income') || c.includes('student') || c.includes('state') || c.includes('district')
    );
    priority = matchScore >= 60 ? 'medium' : 'low';
  }

  return {
    category: category_result,
    matchScore,
    confidence,
    reason,
    priority,
    missingCriteria,
    canFix,
    missingDocuments: missingDocs,
  };
}

function getIncomeLimit(scheme: Scheme): number {
  const category = scheme.category.toLowerCase();
  if (category.includes('education') || category.includes('scholar')) return 800000;
  if (category.includes('housing')) return 1800000;
  if (category.includes('senior') || category.includes('pension')) return 200000;
  if (category.includes('women') || category.includes('widow')) return 200000;
  return 3000000;
}

function checkCategoryMatch(scheme: Scheme, profile: Profile): boolean {
  const eligibility = scheme.eligibility || [];
  const profileCategory = profile.category?.toLowerCase() || '';
  return eligibility.some(e => {
    const eLower = e.toLowerCase();
    return eLower.includes(profileCategory) ||
      (profileCategory === 'obc' && (eLower.includes('obc') || eLower.includes('ebc') || eLower.includes('nt'))) ||
      (profileCategory === 'sc' && eLower.includes('sc')) ||
      (profileCategory === 'st' && eLower.includes('st')) ||
      (profileCategory === 'ews' && eLower.includes('ews'));
  });
}

function getProfileDocuments(profile: Profile): string[] {
  const docs: string[] = ['Aadhaar Card'];
  if (profile.annual_income > 0) docs.push('Income Certificate');
  if (profile.category && profile.category !== 'General') docs.push('Caste Certificate');
  if (profile.occupation) docs.push('Bank Passbook');
  return docs;
}

function calculatePriorityScore(
  eligible: EligibleScheme[],
  almostEligible: AlmostEligibleScheme[]
): number {
  const highPriority = eligible.filter(e => e.priority === 'high').length;
  const mediumPriority = eligible.filter(e => e.priority === 'medium').length;
  const lowPriority = eligible.filter(e => e.priority === 'low').length;
  const almost = almostEligible.length;

  const score = (highPriority * 3) + (mediumPriority * 2) + lowPriority + (almost * 0.5);
  return Math.min(100, Math.round(score * 5));
}

function calculateConfidence(
  total: number,
  eligible: number,
  almost: number
): number {
  if (total === 0) return 0;
  const ratio = (eligible + almost * 0.5) / total;
  return Math.round(ratio * 100);
}
