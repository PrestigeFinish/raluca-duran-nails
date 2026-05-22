"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Eroare la schimbarea parolei.");
      return;
    }

    setMessage("Parola a fost schimbată cu succes. Te poți autentifica.");
  }

  return (
    <main
      style={{
        maxWidth: "500px",
        margin: "80px auto",
        padding: "20px",
      }}
    >
      <h1>Resetează parola</h1>

      <form onSubmit={updatePassword}>
        <input
          type="password"
          placeholder="Noua parolă"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: "14px",
            marginTop: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <button
          type="submit"
          style={{
            marginTop: "20px",
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            background: "#b8836d",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Schimbă parola
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </main>
  );
}
