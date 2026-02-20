import type { SavedMovieRow } from "../db/schema.js";

export interface SessionUserDTO {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
}

export interface SavedMovieDTO {
  tmdbMovieId: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
  isWatched: boolean;
  savedAt: string;
}

export interface TrendingMovieDTO {
  searchTerm: string;
  movieId: number;
  title: string;
  posterUrl: string;
  count: number;
}

export const toSavedMovieDTO = (movie: SavedMovieRow): SavedMovieDTO => ({
  tmdbMovieId: movie.tmdbMovieId,
  title: movie.title,
  posterPath: movie.posterPath,
  releaseDate: movie.releaseDate,
  voteAverage: movie.voteAverage,
  isWatched: movie.isWatched,
  savedAt: movie.createdAt.toISOString(),
});
