"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function toMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");

  const m = (minutes % 60)
    .toString()
    .padStart(2, "0");

  return `${h}:${m}`;
}

function getSlots(category: string) {
  if (category === "nails") {
    return ["09:00", "12:00", "15:00", "18:00"];
  }

  if (category === "makeup") {
    return ["09:00", "11:00", "13:00", "15:00", "17:00", "19:00"];
  }

  return [];
}

function ProgramareContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const selectedService = services.find((s) => s.id === serviceId);

  useEffect(() => {
    async function loadInitialData() {
      let query = supabase.from("services").select("*").eq("is_active", true);

      if (selectedCategory === "nails" || selectedCategory === "makeup") {
        query = query.eq("category", selectedCategory);
      }

      const { data: servicesData } = await query.order("category").order("name");

      const { data: blockedData } = await supabase
        .from("blocked_days")
        .select("blocked_date");

      setServices(servicesData || []);
      setBlockedDates((blockedData || []).map((d: any) => d.blocked_date));
    }

    loadInitialData();
  }, [selectedCategory]);

  useEffect(() => {
    async function loadAppointments() {
      if (!date) return;

      const { data } = await supabase
        .from("appointments")
        .select(`
          *,
          services (
            duration_minutes,
            buffer_minutes,
            category
          )
        `)
        .eq("appointment_date", date)
        .neq("status", "cancelled");

      setAppointments(data || []);
    }

    loadAppointments();
  }, [date]);

  const availableSlots = useMemo(() => {
    if (!selectedService) return [];
    return getSlots(selectedService.category);
  }, [selectedService]);

  function isSlotUnavailable(slot: string) {
    if (!selectedService || !date) return true;

    if (blockedDates.includes(date)) {
      return true;
    }

    const start = toMinutes(slot);
    const duration = Number(selectedService.duration_minutes || 60);
    const buffer = Number(selectedService.buffer_minutes || 0);
    const end = start + duration + buffer;

    return appointments.some((appointment: any) => {
      const existingStart = toMinutes(appointment.appointment_time);

      const existingDuration = Number(
        appointment.services?.duration_minutes || 60
      );

      const existingBuffer = Number(
        appointment.services?.buffer_minutes || 0
      );

      const existingEnd = appointment.end_time
        ? toMinutes(appointment.end_time)
        : existingStart + existingDuration + existingBuffer;

      return start < existingEnd && end > existingStart;
    });
  }

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!serviceId || !date || !time) {
      setMessage("Alege serviciul, data și ora.");
      return;
    }

    if (blockedDates.includes(date)) {
      setMessage("Zi indisponibilă.");
      return;
    }

    if (isSlotUnavailable(time)) {
      setMessage("Intervalul este deja ocupat.");
      return;
    }

    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        appointment_date: date,
        appointment_time: time,
        notes,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error || "Nu s-a putut face programarea.");
      return;
    }

    setMessage("Programarea a fost trimisă cu succes 💖");

    setServiceId("");
    setDate("");
    setTime("");
    setClientName("");
    setClientPhone("");
    setClientEmail("");
    setNotes("");
  }

  return (
    <main>
      <section className="section" style={{ paddingTop: "160px" }}>
        <div className="container">
          <h1 className="hero-title section-title">
            Programare Raluca Beauty
          </h1>

          <p className="section-lead">
            Nails: 3h / Make-up: 2h
          </p>

          <div
            className="hero-actions"
            style={{ justifyContent: "center", marginBottom: "34px" }}
          >
            <a href="/programare?category=nails" className="btn-secondary">
              Nails
            </a>

            <a href="/programare?category=makeup" className="btn-secondary">
              Make-up
            </a>
          </div>

          <form onSubmit={submitBooking} className="booking-form">
            <label>
              Serviciu
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value);
                  setTime("");
                }}
                required
              >
                <option value="">Alege serviciul</option>

                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.category === "nails" ? "Nails" : "Make-up"} —{" "}
                    {service.name} ({service.price})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Data
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setTime("");
                }}
                required
              />
            </label>

            <label>
              Ora
              <div className="hours-grid">
                {!selectedService && <p>Alege întâi serviciul.</p>}

                {selectedService &&
                  availableSlots.map((slot) => {
                    const disabled = isSlotUnavailable(slot);

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={disabled}
                        onClick={() => setTime(slot)}
                        className={time === slot ? "hour-btn active" : "hour-btn"}
                      >
                        {disabled ? `${slot} ocupat` : slot}
                      </button>
                    );
                  })}
              </div>
            </label>

            <label>
              Nume
              <input
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            </label>

            <label>
              Telefon
              <input
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </label>

            <label>
              Observații
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <button className="btn-primary" type="submit" disabled={!time}>
              Trimite programarea
            </button>

            {message && <p className="booking-message">{message}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

export default function ProgramarePage() {
  return (
    <Suspense>
      <ProgramareContent />
    </Suspense>
  );
}
