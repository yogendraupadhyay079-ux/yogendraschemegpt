import { supabase } from '../lib/supabase';
import type { AIHistory } from '../lib/database.types';

export async function getAIHistory(userId: string): Promise<AIHistory[]> {
  const { data, error } = await supabase
    .from('ai_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching AI history:', error);
    return [];
  }

  return data ?? [];
}

export async function addAIHistory(
  userId: string,
  prompt: string,
  response: string,
  conversationId?: string
): Promise<AIHistory | null> {
  const { data, error } = await supabase
    .from('ai_history')
    .insert({
      user_id: userId,
      prompt,
      response,
      conversation_id: conversationId ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding AI history:', error);
    return null;
  }

  return data;
}

export async function deleteAIHistory(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('ai_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting AI history:', error);
    return false;
  }

  return true;
}
