import { Request, Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";
import { recentSearchService } from "../services/recent-search.service";
import { createRecentSearchSchema } from "../validators/recent-search.validator";
import { BadRequestError } from "../errors/BadRequestError";

export const recentSearchController = {
  async create(req: AuthRequest, res: Response) {
    const parsed = createRecentSearchSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }

    const search = await recentSearchService.create(
      req.user!.userId,
      parsed.data,
    );

    res.status(201).json(search);
  },

  async findAll(req: AuthRequest, res: Response) {
    const searches = await recentSearchService.findAll(req.user!.userId);

    res.json(searches);
  },

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id;

    await recentSearchService.delete(req.user!.userId, id);

    res.status(204).send();
  },

  async clear(req: AuthRequest, res: Response) {
    await recentSearchService.clear(req.user!.userId);

    res.status(204).send();
  },
};
