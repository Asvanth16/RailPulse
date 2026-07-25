import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";
import type { RegisterInput } from "../validators/auth.validator";
import { ConflictError } from "../errors/ConflictError";
import { toUserResponse } from "../utils/user.mapper";

const SALT_ROUNDS = 12;

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
    });

    const token = generateAccessToken(user.id);

    return {
      token,
      user: toUserResponse(user),
    };
  },
};
