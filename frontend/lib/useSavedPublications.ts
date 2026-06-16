import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import type { SearchResult } from '@/lib/useSearch';

export interface SavedPublication extends SearchResult {
  id?: string;
  thesis_title: string;
  star_rating?: number;
  notes?: string;
  created_at?: string;
}

export function useSavedPublications() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const savePublication = useCallback(
    async (publication: SavedPublication) => {
      setLoading(true);
      setError(null);
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('Not authenticated');

        const { error: err } = await supabase
          .from('saved_publications')
          .insert({
            user_id: userData.user.id,
            thesis_title: publication.thesis_title,
            source: publication.source,
            title: publication.title,
            authors: publication.authors || [],
            year: publication.year,
            doi: publication.doi,
            url: publication.url,
            abstract: publication.abstract,
            citation_count: publication.citation_count || 0,
            relevance_score: publication.relevance_score || 0.5,
            star_rating: publication.star_rating || null,
            notes: publication.notes || null,
          });

        if (err) throw err;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save publication';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const removePublication = useCallback(
    async (id: string) => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase
          .from('saved_publications')
          .delete()
          .eq('id', id);

        if (err) throw err;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to remove publication';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const updateStarRating = useCallback(
    async (id: string, rating: number) => {
      setLoading(true);
      setError(null);
      try {
        const { error: err } = await supabase
          .from('saved_publications')
          .update({ star_rating: rating })
          .eq('id', id);

        if (err) throw err;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update rating';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [supabase]
  );

  const getSavedIds = useCallback(
    async (thesisTitle: string): Promise<Set<string>> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return new Set();

        const { data, error: err } = await supabase
          .from('saved_publications')
          .select('doi,url')
          .eq('user_id', userData.user.id)
          .eq('thesis_title', thesisTitle);

        if (err) throw err;

        const ids = new Set<string>();
        data?.forEach((item: any) => {
          if (item.doi) ids.add(item.doi);
          if (item.url) ids.add(item.url);
        });

        return ids;
      } catch (err) {
        console.error('Failed to get saved IDs:', err);
        return new Set();
      }
    },
    [supabase]
  );

  const getSavedByThesis = useCallback(
    async (thesisTitle: string): Promise<SavedPublication[]> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return [];

        const { data, error: err } = await supabase
          .from('saved_publications')
          .select('*')
          .eq('user_id', userData.user.id)
          .eq('thesis_title', thesisTitle)
          .order('star_rating', { ascending: false })
          .order('created_at', { ascending: false });

        if (err) throw err;

        return (data as SavedPublication[]) || [];
      } catch (err) {
        console.error('Failed to get saved publications:', err);
        return [];
      }
    },
    [supabase]
  );

  const getAllSavedByUser = useCallback(
    async (): Promise<SavedPublication[]> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return [];

        const { data, error: err } = await supabase
          .from('saved_publications')
          .select('*')
          .eq('user_id', userData.user.id)
          .order('star_rating', { ascending: false })
          .order('created_at', { ascending: false });

        if (err) throw err;

        return (data as SavedPublication[]) || [];
      } catch (err) {
        console.error('Failed to get all saved publications:', err);
        return [];
      }
    },
    [supabase]
  );

  const checkIfSaved = useCallback(
    async (doi?: string, url?: string, thesisTitle?: string): Promise<string | null> => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return null;

        let query = supabase
          .from('saved_publications')
          .select('id')
          .eq('user_id', userData.user.id);

        if (thesisTitle) {
          query = query.eq('thesis_title', thesisTitle);
        }

        if (doi) {
          const { data, error: err } = await query.eq('doi', doi).limit(1);
          if (err) throw err;
          if (data?.length) return data[0].id;
        }

        if (url) {
          const { data, error: err } = await query.eq('url', url).limit(1);
          if (err) throw err;
          if (data?.length) return data[0].id;
        }

        return null;
      } catch (err) {
        console.error('Failed to check if saved:', err);
        return null;
      }
    },
    [supabase]
  );

  return {
    loading,
    error,
    savePublication,
    removePublication,
    updateStarRating,
    getSavedIds,
    getSavedByThesis,
    getAllSavedByUser,
    checkIfSaved,
  };
}
