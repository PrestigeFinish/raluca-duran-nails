"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const statusLabels: Record<string, string> = {
  pending: "În așteptare",
  confirmed: "Confirmată",
  completed: "Finalizată",
  cancelled: "Anulată",
  no_show: "Nu a venit",
};

function rewardPercent(points: number) {
  return Math.min(Math.floor(points / 5) * 5, 20);
}

export default function ClientAccountPage() {
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function loadAccount() {
    setLoading(true);
    
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!clientData) {
      setMessage("Nu am găsit profilul clientei. Creează cont complet.");
      setLoading(false);
      return;
    }

    if (!clientData.auth_user_id) {
      await supabase
        .from("clients")
        .update({ auth_user_id: user.id })
        .eq("id", clientData.id);
    }

    const { data: appointmentData } = await supabase
      .from("appointments")
      .select("*")
      .or(`client_id.eq.${clientData.id},client_email.eq.${clientData.email}`)
      .order("appointment_date", { ascending: false });

    const { data: servicesData } = await supabase.from("services").select("*");
    const { data: notificationsData } = await supabase
  .from("client_notifications")
  .select("*")
  .eq("client_id", clientData.id)
  .order("created_at", { ascending: false });

const { data: favoritesData } = await supabase
  .from("client_favorites")
  .select("*")
  .eq("client_id", clientData.id);

    const servicesMap = new Map((servicesData || []).map((s) => [s.id, s]));

    setClient(clientData);
    setAppointments(
      (appointmentData || []).map((a) => ({
        ...a,
        service: servicesMap.get(a.service_id),
      }))
    );
    setServices(servicesData || []);
    setNotifications(notificationsData || []);
setFavorites(favoritesData || []);
    setLoading(false);
  }

  useEffect(() => {
    loadAccount();
  }, []);

  const points = Number(client?.loyalty_points || 0);
  const percent = rewardPercent(points);
  const nextMilestone = Math.ceil((points + 1) / 5) * 5;
  const pointsToNext = Math.max(nextMilestone - points, 0);

const futureAppointments = appointments.filter(
  (a) =>
    a.status !== "cancelled" &&
    a.status !== "completed" &&
    a.status !== "no_show" &&
    new Date(a.appointment_date) >=
      new Date(new Date().toISOString().slice(0, 10))
);

  const pastAppointments = appointments.filter(
    (a) => new Date(a.appointment_date) < new Date(new Date().toISOString().slice(0, 10)) || a.status === "completed"
  );
  function isFavorite(serviceId: string) {
  return favorites.some((favorite) => favorite.service_id === serviceId);
}

async function toggleFavorite(serviceId: string) {
  if (!client) return;

  const existing = favorites.find((favorite) => favorite.service_id === serviceId);

  if (existing) {
    await supabase.from("client_favorites").delete().eq("id", existing.id);
    setMessage("Serviciu scos de la favorite.");
  } else {
    await supabase.from("client_favorites").insert([
      {
        client_id: client.id,
        service_id: serviceId,
      },
    ]);
    setMessage("Serviciu adăugat la favorite.");
  }

  loadAccount();
}

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function cancelAppointment(token: string) {
    if (!confirm("Sigur vrei să anulezi programarea?")) return;

    const res = await fetch("/api/booking/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel", token }),
    });

    if (!res.ok) {
      setMessage("Nu s-a putut anula programarea.");
      return;
    }

    setMessage("Programarea a fost anulată.");
    loadAccount();
  }

  if (loading) {
    return (
      <main className="section" style={{ paddingTop: "150px" }}>
        <div className="container">Se încarcă...</div>
      </main>
    );
  }

  return (
    <main className="section" style={{ paddingTop: "150px" }}>
      <div className="container">
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h1 className="hero-title section-title">
            Bun venit, {client?.name || "frumoaso"} 💅
          </h1>

          <p className="section-lead">
            Contul tău Raluca Beauty — programări, puncte, beneficii și istoric.
          </p>

        <div className="admin-stats">
  <div className="admin-stat-card">
    <strong>{points}</strong>
    <span>Puncte loyalty</span>
  </div>

  <div className="admin-stat-card">
    <strong>{percent}%</strong>
    <span>Reducere activă</span>
  </div>

  <div className="admin-stat-card">
    <strong>{pointsToNext}</strong>
    <span>Puncte până la reward</span>
  </div>
</div>

<div
  style={{
    marginTop: 20,
    background: "#f5ece7",
    borderRadius: 20,
    padding: 18,
  }}
>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      marginBottom: 10,
      fontWeight: 600,
    }}
  >
    <span>Progress loyalty</span>
    <span>{Math.min(points, 20)}/20</span>
  </div>

  <div
    style={{
      width: "100%",
      height: 14,
      background: "#e7d8d0",
      borderRadius: 999,
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${Math.min((points / 20) * 100, 100)}%`,
        height: "100%",
        background: "#b8846b",
        borderRadius: 999,
        transition: "0.4s ease",
      }}
    />
  </div>

  <p style={{ marginTop: 12 }}>
    Strânge puncte până la 20% reducere. La fiecare 5 puncte primești încă +5% 🎁
  </p>
</div>

          <div style={{ marginTop: 18 }}>
            <p>
              Codul tău referral:
              <strong> {client?.referral_code || "se generează curând"}</strong>
            </p>
            <p>
  Invită o prietenă folosind codul tău și primești +1 punct când își creează cont.
</p>
          </div>

          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>

        {message && <p className="booking-message">{message}</p>}
        
        <h2 className="hero-title admin-section-title">Programările mele</h2>
        <div
  style={{
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 20,
  }}
>
  <a className="btn-primary" href="/programare?category=nails">
    Programare unghii
  </a>

  <a className="btn-primary" href="/programare?category=makeup">
    Programare make-up
  </a>
</div>

        <div className="admin-grid">
          {futureAppointments.map((appointment) => (
            <div key={appointment.id} className="admin-card">
              <strong>{appointment.service?.name || "Serviciu"}</strong>
              <p>{appointment.appointment_date} • {appointment.appointment_time?.slice(0, 5)}</p>
              <p>Status: {statusLabels[appointment.status] || appointment.status}</p>
              <p>
  Categorie: {appointment.service?.category === "makeup" ? "Make-up" : "Nails"}
</p>
              <p>Preț: {appointment.total_price || appointment.service?.price || "-"}</p>

              <div className="admin-actions">
                {appointment.cancel_token && (
                  <button onClick={() => cancelAppointment(appointment.cancel_token)}>
                    Anulează
                  </button>
                )}

                {appointment.reschedule_token && (
                  <a href={`/gestioneaza-programarea?token=${appointment.reschedule_token}`}>
                    Reprogramează
                  </a>
                )}

                <a href={`/programare?category=${appointment.service?.category || "nails"}`}>
                  Rezervă din nou
                </a>
              </div>
            </div>
          ))}
        </div>
        <h2 className="hero-title admin-section-title">Servicii favorite</h2>

<div className="admin-grid">
  {services.map((service) => (
    <div key={service.id} className="admin-card">
      <strong>{service.name}</strong>
      <p>{service.category === "makeup" ? "Make-up" : "Nails"}</p>
      <p>{service.price}</p>

      <div className="admin-actions">
        <button onClick={() => toggleFavorite(service.id)}>
          {isFavorite(service.id) ? "Șterge de la favorite" : "Adaugă la favorite"}
        </button>

        <a href={`/programare?category=${service.category}`}>
          Programează
        </a>
      </div>
    </div>
  ))}
</div>

        <h2 className="hero-title admin-section-title">Istoric</h2>

        <div className="admin-grid">
          {pastAppointments.map((appointment) => (
            <div key={appointment.id} className="admin-card">
              <strong>{appointment.service?.name || "Serviciu"}</strong>
              <p>{appointment.appointment_date} • {appointment.appointment_time?.slice(0, 5)}</p>
              <p>Status: {statusLabels[appointment.status] || appointment.status}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
