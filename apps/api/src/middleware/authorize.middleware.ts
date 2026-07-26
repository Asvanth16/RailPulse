import { Response, NextFunction } from "express";

import { AuthRequest } from "./auth.middleware";
import { UnauthorizedError } from "../errors/UnauthorizedError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { userRepository } from "../repositories/user.repository";
import { UserRole } from "../generated/prisma/enums";

export const authorize =
  (...allowedRoles: UserRole[]) =>
  async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      const user = await userRepository.findById(req.user.userId);

      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      if (!allowedRoles.includes(user.role)) {
        throw new ForbiddenError("You do not have permission to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };