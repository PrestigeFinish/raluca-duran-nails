"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Parolă greșită.");
      return;
    }

    router.push("/admin");
  }

  return (
    <main className="admin-login-page">
      <form onSubmit={handleLogin} className="admin-login-box">
        <h1>ADMIN LOGIN</h1>

        <label>Parolă admin</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Introdu parola"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Se verifică..." : "Intră în admin"}
        </button>

        {error && <p className="admin-error">{error}</p>}
      </form>
    </main>
  );
}
