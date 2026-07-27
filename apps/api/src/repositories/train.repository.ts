import { prisma } from "../lib/prisma";
import { TrainType } from "../generated/prisma/enums";

export const trainRepository = {
  async create(data: {
    trainNumber: string;
    trainName: string;
    trainType: TrainType;
    operator: string;
  }) {
    return prisma.train.create({
      data,
    });
  },

  async findByTrainNumber(trainNumber: string) {
    return prisma.train.findUnique({
      where: {
        trainNumber,
      },
    });
  },

  async findById(id: string) {
    return prisma.train.findUnique({
      where: {
        id,
      },
    });
  },

  async findAll() {
    return prisma.train.findMany({
      orderBy: {
        trainNumber: "asc",
      },
    });
  },

  async update(id: string, data: Partial<{
    trainNumber: string;
    trainName: string;
    trainType: "ICE" | "IC" | "EC" | "RE" | "RB";
    operator: string;
    isActive: boolean;
  }>) {
    return prisma.train.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.train.delete({
      where: { id },
    });
  },
};