import { prisma } from "../lib/prisma";
import { OperationsMonitoredStation } from "../generated/prisma/models";

export interface CreateOperationsMonitoredStationInput {
  eva: number;
  ds100: string;
  name: string;
}

export interface UpdateOperationsMonitoredStationInput {
  ds100?: string;
  name?: string;
  isEnabled?: boolean;
}

export const operationsMonitoredStationRepository = {
  async findAll(): Promise<OperationsMonitoredStation[]> {
    return prisma.operationsMonitoredStation.findMany({
      orderBy: {
        name: "asc",
      },
    });
  },

  async findEnabled(): Promise<OperationsMonitoredStation[]> {
    return prisma.operationsMonitoredStation.findMany({
      where: {
        isEnabled: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  },

  async findById(id: string): Promise<OperationsMonitoredStation | null> {
    return prisma.operationsMonitoredStation.findUnique({
      where: {
        id,
      },
    });
  },

  async findByEva(eva: number): Promise<OperationsMonitoredStation | null> {
    return prisma.operationsMonitoredStation.findUnique({
      where: {
        eva,
      },
    });
  },

  async create(
    data: CreateOperationsMonitoredStationInput,
  ): Promise<OperationsMonitoredStation> {
    return prisma.operationsMonitoredStation.create({
      data: {
        eva: data.eva,
        ds100: data.ds100,
        name: data.name,
      },
    });
  },

  async update(
    id: string,
    data: UpdateOperationsMonitoredStationInput,
  ): Promise<OperationsMonitoredStation> {
    return prisma.operationsMonitoredStation.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string): Promise<OperationsMonitoredStation> {
    return prisma.operationsMonitoredStation.delete({
      where: {
        id,
      },
    });
  },
};
