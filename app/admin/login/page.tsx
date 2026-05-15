"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const response = await fetch("/api/admin-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setMessage("Parolă greșită.");
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <main>
      <section className="section" style={{ paddingTop: "160px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Admin Login</h1>

          <form onSubmit={login} className="booking-form">
            <label>
              Parolă admin
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button className="btn-primary" type="submit">
              Intră în admin
            </button>

            {message && <p className="booking-message">{message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}
