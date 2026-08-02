import { RecentSearchDto } from "../dto/recent-search";
import { recentSearchMapper } from "../mapper/recent-search.mapper";
import { recentSearchRepository } from "../repositories/recent-search.repository";
import { USER_LIMITS } from "../constants/user.constants";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";

import { CreateRecentSearchInput } from "../validators/recent-search.validator";

const MAX_RECENT_SEARCHES = 5;

export const recentSearchService = {
  async create(
    userId: string,
    data: CreateRecentSearchInput,
  ): Promise<RecentSearchDto> {
    // Remove duplicate search if it exists
    const duplicate = await recentSearchRepository.findDuplicate(userId, data);

    if (duplicate) {
      await recentSearchRepository.delete(duplicate.id);
    }

    // Save newest search
    const search = await recentSearchRepository.create(userId, data);

    // Keep only the latest 5 searches
    const count = await recentSearchRepository.countByUser(userId);

    if (count > USER_LIMITS.RECENT_SEARCHES) {
      const oldest = await recentSearchRepository.findOldestByUser(userId);

      if (oldest) {
        await recentSearchRepository.delete(oldest.id);
      }
    }

    return recentSearchMapper.toDto(search);
  },

  async findAll(userId: string): Promise<RecentSearchDto[]> {
    const searches = await recentSearchRepository.findByUserId(userId);

    return recentSearchMapper.toDtoList(searches);
  },

  async delete(userId: string, id: string): Promise<void> {
    const search = await recentSearchRepository.findById(id);

    if (!search) {
      throw new NotFoundError("Recent search not found.");
    }

    if (search.userId !== userId) {
      throw new ForbiddenError(
        "You cannot delete another user's recent search.",
      );
    }

    await recentSearchRepository.delete(id);
  },

  async clear(userId: string): Promise<void> {
    const searches = await recentSearchRepository.findByUserId(userId);

    await Promise.all(
      searches.map((search) => recentSearchRepository.delete(search.id)),
    );
  },
};
