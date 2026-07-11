import { Router } from "express";
import { GetMovieDetailParams } from "@workspace/api-zod";

const router = Router();

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch(path: string) {
  if (!API_KEY) throw new Error("TMDB_API_KEY is not set");

  const separator = path.includes("?") ? "&" : "?";
  const url = `${TMDB_BASE}${path}${separator}api_key=${API_KEY}`;

  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "(unreadable body)");
    throw new Error(`TMDB ${res.status} ${res.statusText}: ${body}`);
  }
  return res.json();
}

router.get("/search", async (req, res): Promise<void> => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (!q) {
    res.status(400).json({ error: "Missing required query parameter: q" });
    return;
  }
  const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) || 1 : 1;
  try {
    const data = await tmdbFetch(
      `/search/movie?language=en-US&query=${encodeURIComponent(q)}&page=${page}&include_adult=false`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/genres", async (_req, res): Promise<void> => {
  try {
    const data = await tmdbFetch("/genre/movie/list?language=en-US");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/by-genre", async (req, res): Promise<void> => {
  const genreId = typeof req.query.genre_id === "string" ? parseInt(req.query.genre_id, 10) : NaN;
  if (isNaN(genreId)) {
    res.status(400).json({ error: "Missing or invalid required query parameter: genre_id" });
    return;
  }
  const page = typeof req.query.page === "string" ? parseInt(req.query.page, 10) || 1 : 1;
  try {
    const data = await tmdbFetch(
      `/discover/movie?language=en-US&with_genres=${genreId}&sort_by=popularity.desc&page=${page}`
    );
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/trending", async (_req, res) => {
  try {
    const data = await tmdbFetch("/trending/movie/week?language=en-US");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/popular", async (_req, res) => {
  try {
    const data = await tmdbFetch("/movie/popular?language=en-US&page=1");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/top-rated", async (_req, res) => {
  try {
    const data = await tmdbFetch("/movie/top_rated?language=en-US&page=1");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/now-playing", async (_req, res) => {
  try {
    const data = await tmdbFetch("/movie/now_playing?language=en-US&page=1");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/upcoming", async (_req, res) => {
  try {
    const data = await tmdbFetch("/movie/upcoming?language=en-US&page=1");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

router.get("/:id", async (req, res) => {
  const parsed = GetMovieDetailParams.safeParse({ id: Number(req.params.id) });
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid movie ID" });
    return;
  }
  try {
    const data = await tmdbFetch(
      `/movie/${parsed.data.id}?language=en-US&append_to_response=credits`
    );
    res.json(data);
  } catch (err: unknown) {
    const msg = String(err);
    if (msg.includes("404")) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.status(500).json({ error: msg });
    }
  }
});

export default router;
