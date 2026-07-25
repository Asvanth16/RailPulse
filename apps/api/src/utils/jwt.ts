import jwt from "jsonwebtoken";
import { env } from "../config/env";

const JWT_SECRET = env.JWT_SECRET;

export function generateAccessToken(userId: string) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
}