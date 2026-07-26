import { prisma } from "../lib/prisma";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    passwordHash: string;
  }) {
    return prisma.user.create({
      data,
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },
};
