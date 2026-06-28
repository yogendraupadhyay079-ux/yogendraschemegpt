import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';
import { getBookmarks, toggleBookmark, isBookmarked } from '../services/bookmark.service';
import type { Bookmark, Scheme } from '../lib/database.types';

export function useBookmarks() {
  const { user } = useAuthStore();
  const [bookmarks, setBookmarks] = useState<(Bookmark & { scheme: Scheme })[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const data = await getBookmarks(user.id);
    setBookmarks(data);
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleToggle = useCallback(async (schemeId: string) => {
    if (!user?.id) return;
    await toggleBookmark(user.id, schemeId);
    loadBookmarks();
  }, [user?.id, loadBookmarks]);

  const checkBookmarked = useCallback(async (schemeId: string) => {
    if (!user?.id) return false;
    return isBookmarked(user.id, schemeId);
  }, [user?.id]);

  return { bookmarks, loading, toggleBookmark: handleToggle, checkBookmarked, refresh: loadBookmarks };
}
