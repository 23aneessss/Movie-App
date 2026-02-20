import { env } from "./env.js";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

export const buildTmdbImageUrl = (posterPath: string | null | undefined) => {
  if (!posterPath) {
    return "https://placehold.co/600x400/1a1a1a/FFFFFF.png";
  }

  return `https://image.tmdb.org/t/p/w500${posterPath}`;
};

const toQueryString = (params?: Record<string, string | number | undefined>) => {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const tmdbGet = async <T>(
  path: string,
  params?: Record<string, string | number | undefined>
): Promise<T> => {
  const response = await fetch(`${TMDB_BASE_URL}${path}${toQueryString(params)}`, {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`TMDB request failed (${response.status}): ${body}`);
  }

  return (await response.json()) as T;
};
