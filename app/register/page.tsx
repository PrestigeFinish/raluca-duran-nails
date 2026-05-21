"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function makeReferralCode(name: string) {
  return (
    "RB-" +
    name
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
      .slice(0, 6) +
    "-" +
    Math.floor(1000 + Math.random() * 9000)
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [message, setMessage] = useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setMessage("Cont creat. Verifică emailul pentru confirmare.");
      return;
    }

    const myReferralCode = makeReferralCode(name);

    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .or(`email.eq.${email},phone.eq.${phone}`)
      .maybeSingle();

    if (existingClient) {
      await supabase
        .from("clients")
        .update({
          auth_user_id: userId,
          name,
          phone,
          email,
          birthday: birthday || null,
          referral_code: existingClient.referral_code || myReferralCode,
          referred_by: referralCode || existingClient.referred_by,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClient.id);
    } else {
      await supabase.from("clients").insert([
        {
          auth_user_id: userId,
          name,
          phone,
          email,
          birthday: birthday || null,
          loyalty_points: 0,
          reward_percent: 0,
          referral_code: myReferralCode,
          referred_by: referralCode || null,
        },
      ]);
    }

    if (referralCode) {
      const { data: referrer } = await supabase
        .from("clients")
        .select("*")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (referrer) {
        await supabase
          .from("clients")
          .update({
            loyalty_points: Number(referrer.loyalty_points || 0) + 1,
            reward_percent: Math.floor((Number(referrer.loyalty_points || 0) + 1) / 5) * 5,
          })
          .eq("id", referrer.id);
      }
    }

    setMessage("Cont creat cu succes. Te poți autentifica.");
  }

  return (
    <main className="section" style={{ paddingTop: "150px" }}>
      <div className="container">
        <form onSubmit={register} className="booking-form">
          <h1 className="hero-title section-title">Creează cont</h1>

          <label>Nume<input value={name} onChange={(e) => setName(e.target.value)} required /></label>
          <label>Telefon<input value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
          <label>Zi de naștere<input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} /></label>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label>
          <label>Parolă<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label>
          <label>Cod referral opțional<input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} /></label>

          <button className="btn-primary" type="submit">Creează cont</button>

          <p>
            Ai deja cont? <a href="/login">Intră în cont</a>
          </p>

          {message && <p className="booking-message">{message}</p>}
        </form>
      </div>
    </main>
  );
}
