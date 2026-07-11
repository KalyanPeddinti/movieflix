import { integer, pgTable, real, serial, text, timestamp, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const watchlistTable = pgTable(
  "watchlist",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    tmdbId: integer("tmdb_id").notNull(),
    title: text("title").notNull(),
    posterPath: text("poster_path"),
    backdropPath: text("backdrop_path"),
    voteAverage: real("vote_average"),
    releaseDate: text("release_date"),
    addedAt: timestamp("added_at").notNull().defaultNow(),
  },
  (t) => [unique("watchlist_user_movie_unique").on(t.userId, t.tmdbId)]
);

export const insertWatchlistSchema = createInsertSchema(watchlistTable).omit({
  id: true,
  addedAt: true,
});

export type InsertWatchlistItem = z.infer<typeof insertWatchlistSchema>;
export type WatchlistItem = typeof watchlistTable.$inferSelect;
