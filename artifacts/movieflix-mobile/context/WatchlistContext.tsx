import React, { createContext, useContext, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetMyList,
  useAddToMyList,
  useRemoveFromMyList,
  getGetMyListQueryKey,
  type WatchlistMovieItem,
  type AddToWatchlistBody,
} from '@workspace/api-client-react';
import { useAuth } from '@/context/AuthContext';

export type { WatchlistMovieItem, AddToWatchlistBody };

interface WatchlistContextValue {
  items: WatchlistMovieItem[];
  isInList: (tmdbId: number) => boolean;
  addToList: (movie: AddToWatchlistBody) => void;
  removeFromList: (tmdbId: number) => void;
  isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetMyList({
    query: { enabled: !!user, queryKey: getGetMyListQueryKey() },
  });

  const items = data?.items ?? [];
  const tmdbIdSet = new Set(items.map((i) => i.tmdb_id));

  const addMutation = useAddToMyList({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyListQueryKey() });
      },
    },
  });

  const removeMutation = useRemoveFromMyList({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMyListQueryKey() });
      },
    },
  });

  const isInList = (tmdbId: number) => tmdbIdSet.has(tmdbId);

  const addToList = (movie: AddToWatchlistBody) => {
    addMutation.mutate({ data: movie });
  };

  const removeFromList = (tmdbId: number) => {
    removeMutation.mutate({ tmdbId });
  };

  return (
    <WatchlistContext.Provider value={{ items, isInList, addToList, removeFromList, isLoading }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error('useWatchlist must be used inside WatchlistProvider');
  return ctx;
}
