import { prisma } from "../lib/prisma";
import { Station } from "../generated/prisma/models";
import {
  CreateStationInput,
  UpdateStationInput,
} from "../validators/station.validator";

export const stationRepository = {
  async create(data: CreateStationInput): Promise<Station> {
    return prisma.station.create({
      data,
    });
  },

  async findByCode(code: string): Promise<Station | null> {
    return prisma.station.findUnique({
      where: {
        code,
      },
    });
  },

  async findById(id: string): Promise<Station | null> {
    return prisma.station.findUnique({
      where: {
        id,
      },
    });
  },

  async findAll(): Promise<Station[]> {
    return prisma.station.findMany({
      orderBy: {
        code: "asc",
      },
    });
  },

  async update(id: string, data: UpdateStationInput): Promise<Station> {
    return prisma.station.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<Station> {
    return prisma.station.delete({
      where: { id },
    });
  },
};
