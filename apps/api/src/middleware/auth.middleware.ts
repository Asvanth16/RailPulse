import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import { env } from "../config/env";
import { UnauthorizedError } from "../errors/UnauthorizedError";

interface JwtPayload {
  userId: string;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication required");
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    req.user = {
      userId: decoded.userId,
    };

    next();
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
};
