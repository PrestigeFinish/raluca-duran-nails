"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const hours = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
];

function ProgramareContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [services, setServices] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [bookedHours, setBookedHours] = useState<string[]>([]);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  const title =
    selectedCategory === "makeup"
      ? "Programare Make-up"
      : selectedCategory === "nails"
      ? "Programare Nails"
      : "Programare";

  useEffect(() => {
    async function loadInitialData() {
      let query = supabase
        .from("services")
        .select("*")
        .eq("is_active", true);

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
    async function loadBookedHours() {
      if (!date) return;

      if (blockedDates.includes(date)) {
        setBookedHours([]);
        setTime("");
        setMessage("Zi indisponibilă pentru programări.");
        return;
      }

      setMessage("");

      const { data } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("appointment_date", date)
        .neq("status", "cancelled");

      setBookedHours(
        (data || []).map((item: any) => item.appointment_time.slice(0, 5))
      );
    }

    loadBookedHours();
  }, [date, blockedDates]);

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();

    if (blockedDates.includes(date)) {
      setMessage("Ziua selectată este indisponibilă.");
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

    setMessage("Programarea a fost trimisă cu succes.");
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
          <h1 className="hero-title section-title">{title}</h1>

          <p className="section-lead">
            Alege serviciul, data și ora dorită.
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

            <a href="/programare" className="btn-secondary">
              Toate
            </a>
          </div>

          <form onSubmit={submitBooking} className="booking-form">
            <label>
              Serviciu
              <select
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
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
                {hours.map((hour) => {
                  const disabled =
                    bookedHours.includes(hour) || blockedDates.includes(date);

                  return (
                    <button
                      key={hour}
                      type="button"
                      disabled={disabled}
                      onClick={() => setTime(hour)}
                      className={time === hour ? "hour-btn active" : "hour-btn"}
                    >
                      {disabled ? "Indisponibil" : hour}
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
