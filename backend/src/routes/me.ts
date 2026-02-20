import { and, asc, eq } from "drizzle-orm";
import { Router } from "express";
import { z } from "zod";

import { db } from "../db/client.js";
import { savedMovies } from "../db/schema.js";
import { HttpError } from "../lib/http.js";
import { toSavedMovieDTO } from "../services/dto.js";
import { assertWatchedRule } from "../services/saved-rules.js";

const savedBodySchema = z.object({
  tmdbMovieId: z.number().int().positive(),
  title: z.string().trim().min(1),
  posterPath: z.string().trim().min(1),
  releaseDate: z.string().trim().min(1),
  voteAverage: z.number(),
});

const watchedBodySchema = z.object({
  isWatched: z.boolean(),
});

const savedQuerySchema = z.object({
  tab: z.enum(["favorites", "watched"]).optional().default("favorites"),
});

const movieIdParamSchema = z.object({
  tmdbMovieId: z.coerce.number().int().positive(),
});

export const meRouter = Router();

meRouter.get("/", async (req, res) => {
  if (!req.currentUser) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  return res.json({
    id: req.currentUser.id,
    name: req.currentUser.name,
    email: req.currentUser.email,
    image: req.currentUser.image ?? null,
    createdAt: req.currentUser.createdAt,
  });
});

meRouter.get("/saved", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const { tab } = savedQuerySchema.parse(req.query);

    const movies = await db
      .select()
      .from(savedMovies)
      .where(
        tab === "watched"
          ? and(
              eq(savedMovies.userId, req.currentUser.id),
              eq(savedMovies.isWatched, true)
            )
          : eq(savedMovies.userId, req.currentUser.id)
      )
      .orderBy(asc(savedMovies.createdAt));

    return res.json(movies.map(toSavedMovieDTO));
  } catch (error) {
    return next(error);
  }
});

meRouter.get("/saved/:tmdbMovieId", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const { tmdbMovieId } = movieIdParamSchema.parse(req.params);

    const [saved] = await db
      .select()
      .from(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, tmdbMovieId)
        )
      )
      .limit(1);

    return res.json(
      saved
        ? toSavedMovieDTO(saved)
        : {
            tmdbMovieId,
            isWatched: false,
            isFavorite: false,
          }
    );
  } catch (error) {
    return next(error);
  }
});

meRouter.post("/saved", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const payload = savedBodySchema.parse(req.body);

    await db
      .insert(savedMovies)
      .values({
        userId: req.currentUser.id,
        tmdbMovieId: payload.tmdbMovieId,
        title: payload.title,
        posterPath: payload.posterPath,
        releaseDate: payload.releaseDate,
        voteAverage: payload.voteAverage,
        isWatched: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    const [saved] = await db
      .select()
      .from(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, payload.tmdbMovieId)
        )
      )
      .limit(1);

    if (!saved) {
      throw new HttpError(404, "Saved movie not found after insert");
    }

    return res.status(201).json(toSavedMovieDTO(saved));
  } catch (error) {
    return next(error);
  }
});

meRouter.patch("/saved/:tmdbMovieId/watched", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const { tmdbMovieId } = movieIdParamSchema.parse(req.params);
    const { isWatched } = watchedBodySchema.parse(req.body);

    const [existing] = await db
      .select()
      .from(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, tmdbMovieId)
        )
      )
      .limit(1);

    assertWatchedRule(Boolean(existing), isWatched);

    if (!existing) {
      throw new HttpError(404, "Favorite movie not found");
    }

    await db
      .update(savedMovies)
      .set({
        isWatched,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, tmdbMovieId)
        )
      );

    const [updated] = await db
      .select()
      .from(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, tmdbMovieId)
        )
      )
      .limit(1);

    if (!updated) {
      throw new HttpError(404, "Favorite movie not found");
    }

    return res.json(toSavedMovieDTO(updated));
  } catch (error) {
    return next(error);
  }
});

meRouter.delete("/saved/:tmdbMovieId", async (req, res, next) => {
  try {
    if (!req.currentUser) {
      throw new HttpError(401, "Unauthorized");
    }

    const { tmdbMovieId } = movieIdParamSchema.parse(req.params);

    await db
      .delete(savedMovies)
      .where(
        and(
          eq(savedMovies.userId, req.currentUser.id),
          eq(savedMovies.tmdbMovieId, tmdbMovieId)
        )
      );

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
