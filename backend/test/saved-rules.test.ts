import { describe, expect, it } from "vitest";

import { HttpError } from "../src/lib/http.js";
import { assertWatchedRule } from "../src/services/saved-rules.js";

describe("assertWatchedRule", () => {
  it("throws 409 when setting watched=true for non-favorite", () => {
    expect(() => assertWatchedRule(false, true)).toThrowError(HttpError);

    try {
      assertWatchedRule(false, true);
    } catch (error) {
      const typedError = error as HttpError;
      expect(typedError.status).toBe(409);
    }
  });

  it("allows watched=false for non-favorite", () => {
    expect(() => assertWatchedRule(false, false)).not.toThrow();
  });

  it("allows watched=true for favorite", () => {
    expect(() => assertWatchedRule(true, true)).not.toThrow();
  });
});
