import type { NextFunction, Request, Response } from "express";

import { auth } from "../auth.js";

export const attachSession = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const headers = new Headers();

    if (req.headers.cookie) {
      headers.set("cookie", req.headers.cookie);
    }

    const session = await auth.api.getSession({ headers });
    req.authSession = session;
    if (session?.user) {
      req.currentUser = session.user;
    }
    next();
  } catch (error) {
    next(error);
  }
};

export const requireSession = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const currentSession = req.authSession;

  if (!currentSession?.session || !currentSession.user) {
    return res.status(401).json({
      error: "Unauthorized",
    });
  }

  req.currentUser = currentSession.user;
  return next();
};
