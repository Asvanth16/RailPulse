import { Station } from "../generated/prisma/models";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";
import { stationRepository } from "../repositories/station.repository";
import {
  CreateStationInput,
  UpdateStationInput,
} from "../validators/station.validator";

export const stationService = {
  async createStation(data: CreateStationInput): Promise<Station> {
    const existingStation = await stationRepository.findByCode(data.code);

    if (existingStation) {
      throw new ConflictError("Station code already exists");
    }

    return stationRepository.create(data);
  },

  async getAllStations(): Promise<Station[]> {
    return stationRepository.findAll();
  },

  async getStationById(id: string): Promise<Station> {
    const station = await stationRepository.findById(id);

    if (!station) {
      throw new NotFoundError("Station not found");
    }

    return station;
  },

  async updateStation(id: string, data: UpdateStationInput): Promise<Station> {
    const station = await stationRepository.findById(id);

    if (!station) {
      throw new NotFoundError("Station not found");
    }

    if (data.code && data.code !== station.code) {
      const existingStation = await stationRepository.findByCode(data.code);

      if (existingStation) {
        throw new ConflictError("Station code already exists");
      }
    }

    return stationRepository.update(id, data);
  },

  async deleteStation(id: string): Promise<Station> {
    const station = await stationRepository.findById(id);

    if (!station) {
      throw new NotFoundError("Station not found");
    }

    return stationRepository.delete(id);
  },
};
