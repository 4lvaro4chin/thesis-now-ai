import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SearchResult {
  source: 'pubmed' | 'semantic_scholar' | 'openalex';
  title: string;
  authors?: string[];
  year?: number;
  doi?: string;
  pmid?: string;
  url?: string;
  abstract?: string;
  relevance_score: number;
}

export interface SearchJob {
  id: string;
  title: string;
  status: 'pending' | 'generating_query' | 'searching' | 'completed' | 'error';
  boolean_query?: string;
  results?: SearchResult[];
  error?: string;
  created_at: string;
  completed_at?: string;
}

export function useSearch() {
  const [job, setJob] = useState<SearchJob | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSearch = useCallback(
    async (title: string, databases: string[] = ['pubmed', 'semantic_scholar']) => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, databases }),
        });

        if (!response.ok) throw new Error('Failed to start search');

        const data = await response.json();
        setJob({ ...data, title, status: 'pending', created_at: new Date().toISOString() });
        return data.job_id;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const pollSearch = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`${API_BASE}/search/${jobId}`);

      if (!response.ok) throw new Error('Failed to fetch search status');

      const data: SearchJob = await response.json();
      setJob(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  }, []);

  const waitForCompletion = useCallback(
    async (jobId: string, maxWait = 180000) => {
      const startTime = Date.now();
      const pollInterval = 2000; // 2 seconds

      return new Promise<SearchJob>((resolve, reject) => {
        const poll = async () => {
          try {
            const jobData = await pollSearch(jobId);

            if (jobData.status === 'completed') {
              resolve(jobData);
              return;
            }

            if (jobData.status === 'error') {
              reject(new Error(jobData.error || 'Search failed'));
              return;
            }

            const elapsed = Date.now() - startTime;
            if (elapsed > maxWait) {
              reject(new Error('Search timeout'));
              return;
            }

            setTimeout(poll, pollInterval);
          } catch (err) {
            reject(err);
          }
        };

        poll();
      });
    },
    [pollSearch]
  );

  return {
    job,
    loading,
    error,
    startSearch,
    pollSearch,
    waitForCompletion,
  };
}
