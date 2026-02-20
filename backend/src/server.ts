import cors from "cors";
import express from "express";
import { APIError } from "better-auth/api";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";

import { auth } from "./auth.js";
import { corsOrigins, env } from "./lib/env.js";
import { HttpError } from "./lib/http.js";
import { attachSession, requireSession } from "./middleware/session.js";
import { meRouter } from "./routes/me.js";
import { moviesRouter } from "./routes/movies.js";

export const createServer = () => {
  const app = express();

  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    })
  );

  app.all("/api/auth/*", toNodeHandler(auth));

  app.use(express.json());
  app.use(attachSession);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api/movies", moviesRouter);
  app.use("/api/me", requireSession, meRouter);

  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(422).json({
        error: "Validation error",
        details: err.issues,
      });
    }

    if (err instanceof HttpError) {
      return res.status(err.status).json({
        error: err.message,
      });
    }

    if (err instanceof APIError) {
      return res.status(Number(err.status) || 500).json({
        error: err.message,
      });
    }

    console.error(err);
    return res.status(500).json({
      error: "Internal server error",
    });
  });

  return app;
};

const app = createServer();

app.listen(env.PORT, () => {
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
