"use client";

import { useEffect, useState } from "react";

export default function ManageBookingPage() {
  const [token, setToken] = useState("");
  const [appointment, setAppointment] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token") || "";
    setToken(urlToken);

    if (urlToken) {
      fetch(`/api/booking/manage?token=${urlToken}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.appointment) setAppointment(data.appointment);
          if (data.error) setMessage(data.error);
        });
    }
  }, []);

  async function cancelBooking() {
    if (!confirm("Sigur vrei să anulezi programarea?")) return;

    const res = await fetch("/api/booking/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "cancel",
        token,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Nu s-a putut anula programarea.");
      return;
    }

    setMessage("Programarea a fost anulată.");
    setAppointment({ ...appointment, status: "cancelled" });
  }

  async function rescheduleBooking(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/booking/manage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "reschedule",
        token,
        appointment_date: newDate,
        appointment_time: newTime,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Nu s-a putut muta programarea.");
      return;
    }

    setMessage("Programarea a fost reprogramată.");
    setAppointment({
      ...appointment,
      appointment_date: newDate,
      appointment_time: newTime,
      status: "pending",
    });
  }

  return (
    <main className="section" style={{ paddingTop: "140px" }}>
      <div className="container">
        <h1 className="hero-title section-title">Gestionează programarea</h1>

        {message && <p className="booking-message">{message}</p>}

        {!appointment && !message && <p>Se încarcă programarea...</p>}

        {appointment && (
          <div className="booking-form">
            <h2>{appointment.services?.name}</h2>

            <p>
              <strong>Clientă:</strong> {appointment.client_name}
            </p>
            <p>
              <strong>Data:</strong> {appointment.appointment_date}
            </p>
            <p>
              <strong>Ora:</strong> {appointment.appointment_time?.slice(0, 5)}
            </p>
            <p>
              <strong>Status:</strong> {appointment.status}
            </p>

            {appointment.status !== "cancelled" && (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelBooking}
                >
                  Anulează programarea
                </button>

                <hr />

                <h3>Reprogramează</h3>

                <form onSubmit={rescheduleBooking}>
                  <label>
                    Data nouă
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </label>

                  <label>
                    Ora nouă
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      required
                    >
                      <option value="">Alege ora</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="11:00">11:00</option>
                      <option value="12:00">12:00</option>
                      <option value="13:00">13:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="17:00">17:00</option>
                      <option value="18:00">18:00</option>
                    </select>
                  </label>

                  <button className="btn-primary" type="submit">
                    Trimite reprogramarea
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
