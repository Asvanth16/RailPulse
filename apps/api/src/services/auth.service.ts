import bcrypt from "bcrypt";
import { userRepository } from "../repositories/user.repository";
import { generateAccessToken } from "../utils/jwt";
import type { RegisterInput, LoginInput } from "../validators/auth.validator";
import { UnauthorizedError } from "../errors/UnauthorizedError";
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
  async login(data: LoginInput) {
    // Step 1: Find user by email
    const user = await userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Step 2: Compare password
    const isPasswordValid = await bcrypt.compare(
      data.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Step 3: Generate JWT
    const token = generateAccessToken(user.id);

    // Step 4: Return response
    return {
      token,
      user: toUserResponse(user),
    };
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    return toUserResponse(user);
  },
};
