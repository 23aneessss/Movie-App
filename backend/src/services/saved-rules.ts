import { HttpError } from "../lib/http.js";

export const assertWatchedRule = (isFavorite: boolean, nextWatchedState: boolean) => {
  if (!isFavorite && nextWatchedState) {
    throw new HttpError(409, "Movie must be favorited before marking watched");
  }
};
