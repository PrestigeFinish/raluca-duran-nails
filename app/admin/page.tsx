"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  async function loadAppointments() {
    const { data, error } = await supabase
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

    if (error) {
      setMessage("Nu s-au putut încărca programările.");
      return;
    }

    setAppointments(data || []);
  }

  async function updateStatus(id: string, status: string) {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      setMessage("Nu s-a putut actualiza statusul.");
      return;
    }

    setMessage("Status actualizat.");
    loadAppointments();
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <main>
      <section className="section" style={{ paddingTop: "150px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Admin Programări</h1>

          <p className="section-lead">
            Aici apar programările venite din formularul de pe site.
          </p>

          {message && <p className="booking-message">{message}</p>}

          <div className="admin-grid">
            {appointments.map((appointment) => (
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

                  <p>
                    <strong>Data:</strong> {appointment.appointment_date}
                  </p>

                  <p>
                    <strong>Ora:</strong>{" "}
                    {appointment.appointment_time?.slice(0, 5)}
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
                  <button
                    onClick={() => updateStatus(appointment.id, "confirmed")}
                  >
                    Confirmă
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "completed")}
                  >
                    Finalizată
                  </button>

                  <button
                    onClick={() => updateStatus(appointment.id, "cancelled")}
                  >
                    Anulează
                  </button>

                  <a
                    href={`https://wa.me/4${appointment.client_phone.replace(
                      /^0/,
                      ""
                    )}`}
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
      </section>
    </main>
  );
}
