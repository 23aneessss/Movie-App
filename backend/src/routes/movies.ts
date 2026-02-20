import { and, desc, eq, sql } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { db } from "../db/client.js";
import { searchTrends, savedMovies } from "../db/schema.js";
import { HttpError } from "../lib/http.js";
import { buildTmdbImageUrl, tmdbGet } from "../lib/tmdb.js";

const querySchema = z.object({
  q: z.string().trim().min(1, "Query is required"),
});

const movieIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

interface TmdbMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
}

interface TmdbSearchResponse {
  page: number;
  results: TmdbMovieResult[];
  total_pages: number;
  total_results: number;
}

export const moviesRouter = Router();

moviesRouter.get("/discover", async (_req, res, next) => {
  try {
    const discover = await tmdbGet("/discover/movie", {
      sort_by: "popularity.desc",
    });

    res.json(discover);
  } catch (error) {
    next(error);
  }
});

moviesRouter.get("/search", async (req, res, next) => {
  try {
    const { q } = querySchema.parse(req.query);

    const payload = await tmdbGet<TmdbSearchResponse>("/search/movie", {
      query: q,
    });

    const firstMovie = payload.results[0];

    if (firstMovie) {
      await db
        .insert(searchTrends)
        .values({
          searchTerm: q,
          movieId: firstMovie.id,
          title: firstMovie.title,
          posterUrl: buildTmdbImageUrl(firstMovie.poster_path),
          count: 1,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: searchTrends.searchTerm,
          set: {
            movieId: firstMovie.id,
            title: firstMovie.title,
            posterUrl: buildTmdbImageUrl(firstMovie.poster_path),
            count: sql`${searchTrends.count} + 1`,
            updatedAt: new Date(),
          },
        });
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
});

moviesRouter.get("/trending", async (_req, res, next) => {
  try {
    const trends = await db
      .select({
        searchTerm: searchTrends.searchTerm,
        movieId: searchTrends.movieId,
        title: searchTrends.title,
        posterUrl: searchTrends.posterUrl,
        count: searchTrends.count,
      })
      .from(searchTrends)
      .orderBy(desc(searchTrends.count), desc(searchTrends.updatedAt))
      .limit(5);

    res.json(trends);
  } catch (error) {
    next(error);
  }
});

moviesRouter.get("/:id", async (req, res, next) => {
  try {
    const { id } = movieIdSchema.parse(req.params);
    const details = await tmdbGet(`/movie/${id}`);
    res.json(details);
  } catch (error) {
    next(error);
  }
});

moviesRouter.get("/:id/saved-status", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const { id } = movieIdSchema.parse(req.params);

    const [saved] = await db
      .select()
      .from(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, id)
        )
      )
      .limit(1);

    res.json({
      isFavorite: Boolean(saved),
      isWatched: saved?.isWatched ?? false,
    });
  } catch (error) {
    next(error);
  }
});
