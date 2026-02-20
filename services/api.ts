import { authClient } from "@/lib/auth-client";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  authenticated?: boolean;
}

const request = async <T>(path: string, options: RequestOptions = {}) => {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.authenticated) {
    const cookie = await authClient.getCookie();
    if (cookie) {
      headers.cookie = cookie;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error ?? response.statusText;
    throw new ApiError(response.status, message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

export const fetchMovies = async ({ query }: { query: string }): Promise<Movie[]> => {
  if (!query.trim()) {
    const data = await request<{ results: Movie[] }>("/api/movies/discover");
    return data.results;
  }

  const encodedQuery = encodeURIComponent(query.trim());
  const data = await request<{ results: Movie[] }>(`/api/movies/search?q=${encodedQuery}`);
  return data.results;
};

export const fetchTrendingMovies = async (): Promise<TrendingMovie[]> => {
  return request<TrendingMovie[]>("/api/movies/trending");
};

export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
  return request<MovieDetails>(`/api/movies/${movieId}`);
};

export const fetchCurrentUser = async (): Promise<SessionUserDTO> => {
  return request<SessionUserDTO>("/api/me", { authenticated: true });
};

export const fetchSavedMovies = async (
  tab: "favorites" | "watched"
): Promise<SavedMovieDTO[]> => {
  return request<SavedMovieDTO[]>(`/api/me/saved?tab=${tab}`, {
    authenticated: true,
  });
};

export const fetchMovieSavedStatus = async (
  movieId: number
): Promise<MovieSavedStatus> => {
  return request<MovieSavedStatus>(`/api/movies/${movieId}/saved-status`, {
    authenticated: true,
  });
};

interface SaveMovieInput {
  tmdbMovieId: number;
  title: string;
  posterPath: string;
  releaseDate: string;
  voteAverage: number;
}

const mapMovieToSavePayload = (movie: Movie | MovieDetails): SaveMovieInput => ({
  tmdbMovieId: movie.id,
  title: movie.title,
  posterPath: movie.poster_path ?? "https://placehold.co/600x400/1a1a1a/FFFFFF.png",
  releaseDate: movie.release_date ?? "N/A",
  voteAverage: movie.vote_average ?? 0,
});

export const saveFavoriteMovie = async (
  movie: Movie | MovieDetails
): Promise<SavedMovieDTO> => {
  return request<SavedMovieDTO>("/api/me/saved", {
    method: "POST",
    body: mapMovieToSavePayload(movie),
    authenticated: true,
  });
};

export const removeFavoriteMovie = async (movieId: number): Promise<void> => {
  await request<void>(`/api/me/saved/${movieId}`, {
    method: "DELETE",
    authenticated: true,
  });
};

export const updateWatchedStatus = async (
  movieId: number,
  isWatched: boolean
): Promise<SavedMovieDTO> => {
  return request<SavedMovieDTO>(`/api/me/saved/${movieId}/watched`, {
    method: "PATCH",
    body: { isWatched },
    authenticated: true,
  });
};

export const buildPosterUrl = (posterPath: string) => {
  if (posterPath.startsWith("http")) {
    return posterPath;
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};
