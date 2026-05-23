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

function getSlots(service: any, date?: string, dailyHours: any[] = []) {
  if (!service) return [];

  const normalizedDate = date || "";

  const override = normalizedDate
    ? dailyHours.find((day) => day.work_date === normalizedDate)
    : null;

  if (override && !override.is_open) return [];

  const start = override?.start_time?.slice(0, 5) || "09:00";
  const end = override?.end_time?.slice(0, 5) || "19:00";

  const duration =
    Number(service.duration_minutes || 60) +
    Number(service.buffer_minutes || 0);

  const slots: string[] = [];
  let current = toMinutes(start);
  const endMinutes = toMinutes(end);

  while (current + duration <= endMinutes) {
    slots.push(toTime(current));
    current += 60;
  }

  return slots;
}
function ProgramareContent() {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");

  const [services, setServices] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [dailyHours, setDailyHours] = useState<any[]>([]);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [calendarBooking, setCalendarBooking] = useState<any>(null);
  const [loggedClient, setLoggedClient] = useState<any>(null);
const [useReward, setUseReward] = useState(false);

  const selectedService = services.find((s) => s.id === serviceId);
  const normalPrice =
  Number(String(selectedService?.price || "").replace(/[^\d.,]/g, "").replace(",", ".")) || 0;

const discountPercent =
  useReward && loggedClient ? Number(loggedClient.reward_percent || 0) : 0;

const discountedPrice =
  discountPercent > 0
    ? Math.round(normalPrice - (normalPrice * discountPercent) / 100)
    : normalPrice;
  useEffect(() => {
  async function loadLoggedClient() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .or(`auth_user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (clientData) {
      setLoggedClient(clientData);
      setClientName(clientData.name || "");
      setClientPhone(clientData.phone || "");
      setClientEmail(clientData.email || "");
    }
  }

  loadLoggedClient();
}, []);

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
      const { data: dailyHoursData } = await supabase
  .from("daily_working_hours")
  .select("*");

      setServices(servicesData || []);
      setBlockedDates((blockedData || []).map((d: any) => d.blocked_date));
      setDailyHours(dailyHoursData || []);
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

  return getSlots(selectedService, date, dailyHours);
}, [selectedService, date, dailyHours]);

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
  function addToCalendar() {
  if (!calendarBooking) return;

  const start = new Date(`${calendarBooking.date}T${calendarBooking.time}:00`);
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + Number(calendarBooking.duration || 60));

  function formatDate(date: Date) {
    return date
      .toISOString()
      .replace(/[-:]/g, "")
      .split(".")[0] + "Z";
  }

  const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Raluca Beauty//Booking//RO
BEGIN:VEVENT
UID:${Date.now()}@ralucabeauty.ro
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:Programare Raluca Beauty - ${calendarBooking.serviceName}
DESCRIPTION:Programare la Raluca Beauty. Serviciu: ${calendarBooking.serviceName}
END:VEVENT
END:VCALENDAR
`.trim();

  const blob = new Blob([icsContent], {
    type: "text/calendar;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  window.open(url, "_blank");

setTimeout(() => {
  URL.revokeObjectURL(url);
}, 3000);
}

  async function submitBooking(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    const today = new Date().toISOString().slice(0, 10);

if (date && date < today) {
  setMessage("Nu poți face programare pe o dată trecută.");
  return;
}

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
        use_reward: useReward,
client_auth_id: loggedClient?.auth_user_id || null,
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
    setCalendarBooking({
  serviceName: selectedService?.name || "Programare",
  date,
  time,
  duration: selectedService?.duration_minutes || 60,
});

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
  min={new Date().toISOString().slice(0, 10)}
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
            {loggedClient && selectedService && Number(loggedClient.reward_percent || 0) > 0 && (
  <div
    style={{
      background: "#f5ece7",
      padding: 16,
      borderRadius: 16,
      border: "1px solid #e7d8d0",
    }}
  >
    <label>
      <input
        type="checkbox"
        checked={useReward}
        onChange={(e) => setUseReward(e.target.checked)}
        style={{ marginRight: 8 }}
      />
      Folosesc reducerea loyalty de {loggedClient.reward_percent}%
    </label>

    <div style={{ marginTop: 12 }}>
      <p>Preț normal: {normalPrice} lei</p>

      {useReward && (
        <>
          <p>Reducere loyalty: -{loggedClient.reward_percent}%</p>
          <p>
            <strong>Preț final: {discountedPrice} lei</strong>
          </p>
        </>
      )}
    </div>
  </div>
)}

            <button className="btn-primary" type="submit" disabled={!time}>
              Trimite programarea
            </button>

            {message && <p className="booking-message">{message}</p>}
            {calendarBooking && (
  <button
    type="button"
    className="btn-secondary"
    onClick={addToCalendar}
  >
    Adaugă în calendar
  </button>
)}
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
