"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedDays, setBlockedDays] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [message, setMessage] = useState("");

  async function loadData() {
    const { data: appointmentData } = await supabase
      .from("appointments")
      .select(`
        *,
        services (
          name,
          category,
          price,
          duration_minutes
        )
      `)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    const { data: blockedData } = await supabase
      .from("blocked_days")
      .select("*")
      .order("blocked_date", { ascending: true });

    setAppointments(appointmentData || []);
    setBlockedDays(blockedData || []);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setMessage("Status actualizat.");
    loadData();
  }

  async function blockDay(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedDate) return;

    const { error } = await supabase.from("blocked_days").insert([
      {
        blocked_date: selectedDate,
        reason: blockReason || "Zi blocată",
        is_full_day: true,
      },
    ]);

    if (error) {
      setMessage("Nu s-a putut bloca ziua.");
      return;
    }

    setMessage("Zi blocată cu succes.");
    setSelectedDate("");
    setBlockReason("");
    loadData();
  }

  async function unblockDay(id: string) {
    await supabase.from("blocked_days").delete().eq("id", id);
    setMessage("Zi deblocată.");
    loadData();
  }

  useEffect(() => {
    loadData();
  }, []);

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((groups: any, appointment) => {
      const date = appointment.appointment_date;

      if (!groups[date]) {
        groups[date] = [];
      }

      groups[date].push(appointment);
      return groups;
    }, {});
  }, [appointments]);

  const totalPending = appointments.filter((a) => a.status === "pending").length;
  const totalConfirmed = appointments.filter((a) => a.status === "confirmed").length;
  const totalCompleted = appointments.filter((a) => a.status === "completed").length;

  return (
    <main>
      <section className="section" style={{ paddingTop: "150px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Agenda Raluca Duran</h1>

          <p className="section-lead">
            Programări, statusuri, zile blocate și contact rapid cu clientele.
          </p>

          {message && <p className="booking-message">{message}</p>}

          <div className="admin-stats">
            <div className="admin-stat-card">
              <strong>{appointments.length}</strong>
              <span>Total programări</span>
            </div>

            <div className="admin-stat-card">
              <strong>{totalPending}</strong>
              <span>În așteptare</span>
            </div>

            <div className="admin-stat-card">
              <strong>{totalConfirmed}</strong>
              <span>Confirmate</span>
            </div>

            <div className="admin-stat-card">
              <strong>{totalCompleted}</strong>
              <span>Finalizate</span>
            </div>
          </div>

          <div className="admin-panel-layout">
            <div>
              <h2 className="hero-title admin-section-title">Programări</h2>

              {Object.keys(groupedAppointments).length === 0 && (
                <p className="section-lead">Nu există programări încă.</p>
              )}

              {Object.entries(groupedAppointments).map(([date, items]: any) => (
                <div key={date} className="admin-day-group">
                  <h3>{date}</h3>

                  <div className="admin-grid">
                    {items.map((appointment: any) => (
                      <div key={appointment.id} className="admin-card">
                        <div className="admin-card-header">
                          <div>
                            <strong>{appointment.client_name}</strong>
                            <p>{appointment.client_phone}</p>
                          </div>

                          <span className={`status-badge ${appointment.status}`}>
                            {appointment.status}
                          </span>
                        </div>

                        <div className="admin-details">
                          <p>
                            <strong>Ora:</strong>{" "}
                            {appointment.appointment_time?.slice(0, 5)}
                          </p>

                          <p>
                            <strong>Serviciu:</strong>{" "}
                            {appointment.services?.category === "nails"
                              ? "Nails"
                              : "Make-up"}{" "}
                            — {appointment.services?.name}
                          </p>

                          <p>
                            <strong>Preț:</strong> {appointment.services?.price}
                          </p>

                          <p>
                            <strong>Durată:</strong>{" "}
                            {appointment.services?.duration_minutes} min
                          </p>

                          {appointment.client_email && (
                            <p>
                              <strong>Email:</strong> {appointment.client_email}
                            </p>
                          )}

                          {appointment.notes && (
                            <p>
                              <strong>Observații:</strong> {appointment.notes}
                            </p>
                          )}
                        </div>

                        <div className="admin-actions">
                          <button onClick={() => updateStatus(appointment.id, "confirmed")}>
                            Confirmă
                          </button>

                          <button onClick={() => updateStatus(appointment.id, "completed")}>
                            Finalizată
                          </button>

                          <button onClick={() => updateStatus(appointment.id, "cancelled")}>
                            Anulează
                          </button>

                          <a
                            href={`https://wa.me/4${appointment.client_phone.replace(/^0/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <aside className="admin-sidebar">
              <h2 className="hero-title admin-section-title">Zile blocate</h2>

              <form onSubmit={blockDay} className="booking-form">
                <label>
                  Data
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Motiv
                  <input
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Concediu, zi liberă..."
                  />
                </label>

                <button className="btn-primary" type="submit">
                  Blochează ziua
                </button>
              </form>

              <div className="blocked-list">
                {blockedDays.map((day) => (
                  <div key={day.id} className="blocked-card">
                    <div>
                      <strong>{day.blocked_date}</strong>
                      <p>{day.reason}</p>
                    </div>

                    <button onClick={() => unblockDay(day.id)}>Deblochează</button>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
