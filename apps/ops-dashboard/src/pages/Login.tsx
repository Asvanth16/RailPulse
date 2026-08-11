import { useState } from "react";
import type { SyntheticEvent } from "react";
import { login } from "../api/auth.api";

interface LoginProps {
  onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await login({
        email,
        password,
      });

      const user = response.data.user;

      const allowedRoles = [
        "TRAIN_OPERATOR",
        "STATION_MANAGER",
        "ADMIN",
        "SUPER_ADMIN",
      ];

      if (!allowedRoles.includes(user.role)) {
        throw new Error(
          "You do not have permission to access the Operations Dashboard.",
        );
      }

      localStorage.setItem("railpulse_access_token", response.data.token);

      localStorage.setItem("railpulse_user", JSON.stringify(user));

      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <p className="dashboard-eyebrow">RAILPULSE OPERATIONS</p>

          <h1>Operations Login</h1>

          <p>Sign in to access railway operational monitoring.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
