"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage("Email sau parolă greșită.");
      return;
    }

    window.location.href = "/cont";
  }

async function resetPassword() {
  if (!email) {
    setMessage("Scrie emailul pentru resetare.");
    return;
  }

  setMessage("");

  const res = await fetch("/api/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();

  if (!res.ok) {
    setMessage(data.error || "Eroare la trimiterea emailului.");
    return;
  }

  setMessage("Ți-am trimis email pentru resetarea parolei 💖");
}
  return (
    <main className="section" style={{ paddingTop: "150px" }}>
      <div className="container">
        <form onSubmit={login} className="booking-form">
          <h1 className="hero-title section-title">Cont clientă</h1>

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Parolă
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          <button className="btn-primary" type="submit">Intră în cont</button>

          <button type="button" className="btn-secondary" onClick={resetPassword}>
            Am uitat parola
          </button>

          <p>
            Nu ai cont? <a href="/register">Creează cont</a>
          </p>

          {message && <p className="booking-message">{message}</p>}
        </form>
      </div>
    </main>
  );
}
