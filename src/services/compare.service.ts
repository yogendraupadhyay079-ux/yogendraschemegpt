import { supabase } from '../lib/supabase';
import type { CompareHistory, Scheme } from '../lib/database.types';

export async function getCompareHistory(userId: string): Promise<CompareHistory[]> {
  const { data, error } = await supabase
    .from('compare_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching compare history:', error);
    return [];
  }

  return data ?? [];
}

export async function addCompareHistory(
  userId: string,
  schemeIds: string[]
): Promise<CompareHistory | null> {
  const { data, error } = await supabase
    .from('compare_history')
    .insert({ user_id: userId, scheme_ids: schemeIds })
    .select()
    .single();

  if (error) {
    console.error('Error adding compare history:', error);
    return null;
  }

  return data;
}

export async function deleteCompareHistory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('compare_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting compare history:', error);
    return false;
  }

  return true;
}

export async function getSchemesForComparison(schemeIds: string[]): Promise<Scheme[]> {
  const { data, error } = await supabase
    .from('schemes')
    .select('*')
    .in('id', schemeIds)
    .order('ai_score', { ascending: false });

  if (error) {
    console.error('Error fetching schemes for comparison:', error);
    return [];
  }

  return data ?? [];
}
