import { Prisma } from "@prisma/client";

export type AlertWithUser = Prisma.AlertGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
        firstName: true;
        lastName: true;
      };
    };
  };
}>;