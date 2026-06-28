import { supabase } from '../lib/supabase';
import type { Profile } from '../lib/database.types';

export interface ProfileInput {
  fullName: string;
  age: number;
  gender: string;
  state: string;
  district: string;
  category: string;
  annualIncome: number;
  occupation: string;
  education: string;
  disability: boolean;
  farmer: boolean;
  startupFounder: boolean;
  student: boolean;
  widow?: boolean;
  minority?: boolean;
  seniorCitizen?: boolean;
  msme?: boolean;
  women?: boolean;
}

export async function saveProfile(input: ProfileInput): Promise<boolean> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) {
    console.error('No authenticated user');
    return false;
  }

  const { error } = await supabase.from('profiles').upsert({
    user_id: userId,
    full_name: input.fullName,
    email: userData.user?.email ?? '',
    age: input.age,
    gender: input.gender,
    state: input.state,
    district: input.district,
    category: input.category,
    annual_income: input.annualIncome,
    occupation: input.occupation,
    education: input.education,
    disability: input.disability,
    farmer: input.farmer,
    startup_founder: input.startupFounder,
    student: input.student,
    widow: input.widow ?? false,
    minority: input.minority ?? false,
    senior_citizen: input.seniorCitizen ?? false,
    msme: input.msme ?? false,
    women: input.women ?? false,
  });

  if (error) {
    console.error('Error saving profile:', error);
    return false;
  }

  return true;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data as Profile | null;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;

  if (!userId) return null;

  return getProfile(userId);
}
