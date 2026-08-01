import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: requireEnv("DATABASE_URL"),
  JWT_SECRET: requireEnv("JWT_SECRET"),

  DB_API_BASE_URL: requireEnv("DB_API_BASE_URL"),
  DB_CLIENT_ID: requireEnv("DB_CLIENT_ID"),
  DB_API_KEY: requireEnv("DB_API_KEY"),

  REDIS_HOST: requireEnv("REDIS_HOST"),
  REDIS_PORT: Number(requireEnv("REDIS_PORT")),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};
