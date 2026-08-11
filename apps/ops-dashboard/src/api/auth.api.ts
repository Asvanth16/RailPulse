import type {
  AuthApiResponse,
  LoginInput,
} from "../types/auth.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  "http://localhost:5000/api";

export async function login(
  credentials: LoginInput,
): Promise<AuthApiResponse> {
  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message ?? "Login failed",
    );
  }

  return data;
}