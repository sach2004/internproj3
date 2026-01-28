"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      // Fetch session to get role
      const response = await fetch("/api/auth/session");
      const session = await response.json();

      if (session?.user?.role === "PRINCIPAL") {
        router.push("/principal");
      } else if (session?.user?.role === "TEACHER") {
        router.push("/teacher");
      } else if (session?.user?.role === "STUDENT") {
        router.push("/student");
      }

      setEmail("");
      setPassword("");
    } else {
      setError("Invalid email or password");
    }

    setLoading(false);
  }

  return (
    <div>
      <form onSubmit={onSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
