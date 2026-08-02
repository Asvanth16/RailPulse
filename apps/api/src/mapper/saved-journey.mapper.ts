import { SavedJourney } from "../generated/prisma/models";
import { SavedJourneyDto } from "../dto/saved-journey";

export const savedJourneyMapper = {
  toDto(journey: SavedJourney): SavedJourneyDto {
    return {
      id: journey.id,
      name: journey.name,
      fromStationEva: journey.fromStationEva,
      fromStationName: journey.fromStationName,
      toStationEva: journey.toStationEva,
      toStationName: journey.toStationName,
      createdAt: journey.createdAt.toISOString(),
      updatedAt: journey.updatedAt.toISOString(),
    };
  },

  toDtoList(journeys: SavedJourney[]): SavedJourneyDto[] {
    return journeys.map((journey) => this.toDto(journey));
  },
};