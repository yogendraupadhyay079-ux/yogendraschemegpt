import { supabase } from '../lib/supabase';
import type { Bookmark, Scheme } from '../lib/database.types';

export async function getBookmarks(userId: string): Promise<(Bookmark & { scheme: Scheme })[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*, scheme:schemes(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching bookmarks:', error);
    return [];
  }

  return (data as (Bookmark & { scheme: Scheme })[]) ?? [];
}

export async function addBookmark(userId: string, schemeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({ user_id: userId, scheme_id: schemeId });

  if (error) {
    console.error('Error adding bookmark:', error);
    return false;
  }

  return true;
}

export async function removeBookmark(userId: string, schemeId: string): Promise<boolean> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('scheme_id', schemeId);

  if (error) {
    console.error('Error removing bookmark:', error);
    return false;
  }

  return true;
}

export async function isBookmarked(userId: string, schemeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('scheme_id', schemeId)
    .maybeSingle();

  if (error) {
    console.error('Error checking bookmark:', error);
    return false;
  }

  return !!data;
}

export async function toggleBookmark(userId: string, schemeId: string): Promise<boolean> {
  const bookmarked = await isBookmarked(userId, schemeId);
  return bookmarked
    ? removeBookmark(userId, schemeId)
    : addBookmark(userId, schemeId);
}
