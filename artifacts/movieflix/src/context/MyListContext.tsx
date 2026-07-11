import { createContext, useContext, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMyList,
  useAddToMyList,
  useRemoveFromMyList,
  getGetMyListQueryKey,
  type WatchlistMovieItem,
  type AddToWatchlistBody,
} from "@workspace/api-client-react";
import { useAuth } from "./AuthContext";

export type { WatchlistMovieItem };

interface MyListContextValue {
  items: WatchlistMovieItem[];
  isInList: (tmdbId: number) => boolean;
  addToList: (movie: AddToWatchlistBody) => void;
  removeFromList: (tmdbId: number) => void;
  isLoading: boolean;
}

export const MyListContext = createContext<MyListContextValue | null>(null);

export function MyListProvider({ children }: { children: ReactNode }) {
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
    <MyListContext.Provider value={{ items, isInList, addToList, removeFromList, isLoading }}>
      {children}
    </MyListContext.Provider>
  );
}

export function useMyList() {
  const ctx = useContext(MyListContext);
  if (!ctx) throw new Error("useMyList must be used inside MyListProvider");
  return ctx;
}
