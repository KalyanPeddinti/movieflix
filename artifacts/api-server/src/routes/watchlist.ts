import { Router } from "express";
import { and, eq } from "drizzle-orm";
import { db, watchlistTable } from "@workspace/db";
import { requireAuth, type AuthRequest } from "../lib/authMiddleware";

const router = Router();

router.use(requireAuth);

router.get("/", async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  try {
    const rows = await db
      .select()
      .from(watchlistTable)
      .where(eq(watchlistTable.userId, userId))
      .orderBy(watchlistTable.addedAt);

    const items = rows.map((r) => ({
      id: r.id,
      tmdb_id: r.tmdbId,
      title: r.title,
      poster_path: r.posterPath ?? null,
      backdrop_path: r.backdropPath ?? null,
      vote_average: r.voteAverage ?? null,
      release_date: r.releaseDate ?? null,
      added_at: r.addedAt.toISOString(),
    }));

    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.post("/", async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const { tmdb_id, title, poster_path, backdrop_path, vote_average, release_date } = req.body;

  if (!tmdb_id || typeof tmdb_id !== "number") {
    res.status(400).json({ error: "tmdb_id is required and must be a number" });
    return;
  }
  if (!title || typeof title !== "string") {
    res.status(400).json({ error: "title is required" });
    return;
  }

  try {
    const [row] = await db
      .insert(watchlistTable)
      .values({
        userId,
        tmdbId: tmdb_id,
        title,
        posterPath: poster_path ?? null,
        backdropPath: backdrop_path ?? null,
        voteAverage: vote_average ?? null,
        releaseDate: release_date ?? null,
      })
      .onConflictDoNothing()
      .returning();

    if (!row) {
      const [existing] = await db
        .select()
        .from(watchlistTable)
        .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.tmdbId, tmdb_id)));
      res.status(201).json({
        id: existing!.id,
        tmdb_id: existing!.tmdbId,
        title: existing!.title,
        poster_path: existing!.posterPath ?? null,
        backdrop_path: existing!.backdropPath ?? null,
        vote_average: existing!.voteAverage ?? null,
        release_date: existing!.releaseDate ?? null,
        added_at: existing!.addedAt.toISOString(),
      });
      return;
    }

    res.status(201).json({
      id: row.id,
      tmdb_id: row.tmdbId,
      title: row.title,
      poster_path: row.posterPath ?? null,
      backdrop_path: row.backdropPath ?? null,
      vote_average: row.voteAverage ?? null,
      release_date: row.releaseDate ?? null,
      added_at: row.addedAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.delete("/:tmdbId", async (req: AuthRequest, res): Promise<void> => {
  const userId = req.userId!;
  const tmdbId = parseInt(req.params.tmdbId, 10);

  if (isNaN(tmdbId)) {
    res.status(400).json({ error: "Invalid tmdbId" });
    return;
  }

  try {
    await db
      .delete(watchlistTable)
      .where(and(eq(watchlistTable.userId, userId), eq(watchlistTable.tmdbId, tmdbId)));

    res.json({ error: "ok" });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
