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

const tabs = [
  ["dashboard", "Dashboard"],
  ["programari", "Programări"],
  ["manual", "Adaugă programare"],
  ["calendar", "Calendar"],
  ["cliente", "Cliente"],
  ["servicii", "Servicii"],
  ["blocari", "Blocări"],
  ["galerie", "Galerie"],
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function parsePrice(value: any) {
  if (!value) return 0;
  return Number(String(value).replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
}

function sameMonth(date: string, month: string) {
  return date?.slice(0, 7) === month;
}

function thisWeekRange() {
  const now = new Date();
  const day = now.getDay() || 7;
  const start = new Date(now);
  start.setDate(now.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

function getWeekDays() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);

  return Array.from({ length: 7 }).map((_, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return d.toISOString().slice(0, 10);
  });
}

function toMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function generateSlots(category: string) {
  const step = category === "makeup" ? 120 : 180;
  const slots: string[] = [];
  let current = toMinutes("09:00");
  const end = toMinutes("18:00");

  while (current < end) {
    slots.push(toTime(current));
    current += step;
  }

  return slots;
}

export default function AdminPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [blockedDays, setBlockedDays] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [tab, setTab] = useState("dashboard");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(todayIso().slice(0, 7));
  const [filterService, setFilterService] = useState("all");
  const [editAppointment, setEditAppointment] = useState<any>(null);

  const [selectedDate, setSelectedDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [photoCategory, setPhotoCategory] = useState("nails");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [manualServiceId, setManualServiceId] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  const manualService = services.find((s) => s.id === manualServiceId);

  async function loadData() {
    const { data: serviceData } = await supabase
      .from("services")
      .select("*")
      .order("category")
      .order("name");

    const { data: appointmentData } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: true });

    const servicesMap = new Map((serviceData || []).map((s) => [s.id, s]));

    const appointmentsWithServices = (appointmentData || []).map((a) => ({
      ...a,
      services: servicesMap.get(a.service_id) || null,
    }));

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });

    const { data: blockedData } = await supabase
      .from("blocked_days")
      .select("*")
      .order("blocked_date", { ascending: true });

    const { data: photosData } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: notificationsData } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setAppointments(appointmentsWithServices);
    setClients(clientData || []);
    setServices(serviceData || []);
    setBlockedDays(blockedData || []);
    setPhotos(photosData || []);
    setNotifications(notificationsData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  function isManualSlotUnavailable(slot: string) {
    if (!manualService || !manualDate) return true;

    const start = toMinutes(slot);
    const duration = Number(manualService.duration_minutes || 60);
    const buffer = Number(manualService.buffer_minutes || 0);
    const end = start + duration + buffer;

    return appointments
      .filter((a) => a.appointment_date === manualDate && a.status !== "cancelled")
      .some((a) => {
        const existingStart = toMinutes(a.appointment_time);
        const existingDuration = Number(a.services?.duration_minutes || 60);
        const existingBuffer = Number(a.services?.buffer_minutes || 0);
        const existingEnd = a.end_time
          ? toMinutes(a.end_time)
          : existingStart + existingDuration + existingBuffer;

        return start < existingEnd && end > existingStart;
      });
  }

  async function createManualAppointment(e: React.FormEvent) {
    e.preventDefault();

    if (!manualService || !manualDate || !manualTime || !manualName || !manualPhone) {
      setMessage("Completează serviciul, data, ora, numele și telefonul.");
      return;
    }

    if (isManualSlotUnavailable(manualTime)) {
      setMessage("Intervalul ales se suprapune cu altă programare.");
      return;
    }

    const start = toMinutes(manualTime);
    const endTime = toTime(
      start +
        Number(manualService.duration_minutes || 60) +
        Number(manualService.buffer_minutes || 0)
    );

    let clientId = null;

    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", manualPhone)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;

      await supabase
        .from("clients")
        .update({
          name: manualName,
          email: manualEmail || existingClient.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClient.id);
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert([
          {
            name: manualName,
            phone: manualPhone,
            email: manualEmail || null,
          },
        ])
        .select()
        .single();

      clientId = newClient?.id || null;
    }

    await supabase.from("appointments").insert([
      {
        service_id: manualService.id,
        client_id: clientId,
        client_name: manualName,
        client_phone: manualPhone,
        client_email: manualEmail || null,
        appointment_date: manualDate,
        appointment_time: manualTime,
        end_time: endTime,
        total_price: manualService.price,
        notes: manualNotes || "Programare adăugată manual din admin.",
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
        cancel_token: crypto.randomUUID(),
        reschedule_token: crypto.randomUUID(),
      },
    ]);

    setManualServiceId("");
    setManualDate("");
    setManualTime("");
    setManualName("");
    setManualPhone("");
    setManualEmail("");
    setManualNotes("");

    setMessage("Programare adăugată manual.");
    loadData();
  }

  async function updateStatus(id: string, status: string) {
    const extra: any = { status };

    if (status === "confirmed") extra.confirmed_at = new Date().toISOString();
    if (status === "completed") extra.completed_at = new Date().toISOString();
    if (status === "cancelled") extra.cancelled_at = new Date().toISOString();

    await supabase.from("appointments").update(extra).eq("id", id);

    const appointment = appointments.find((a) => a.id === id);

    if (appointment?.client_id && status === "no_show") {
      const client = clients.find((c) => c.id === appointment.client_id);

      await supabase
        .from("clients")
        .update({
          notes: `${client?.notes || ""}\nNo-show la ${appointment.appointment_date} ${appointment.appointment_time}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", appointment.client_id);
    }

    setMessage("Status actualizat.");
    loadData();
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Sigur vrei să ștergi definitiv programarea?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    setMessage("Programare ștearsă definitiv.");
    loadData();
  }

  async function updateClient(id: string, notes: string) {
    await supabase
      .from("clients")
      .update({ notes, updated_at: new Date().toISOString() })
      .eq("id", id);

    setMessage("Notițe clientă salvate.");
    loadData();
  }

  async function blockDay(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDate) return;

    await supabase.from("blocked_days").insert([
      {
        blocked_date: selectedDate,
        reason: blockReason || "Zi blocată",
        is_full_day: true,
      },
    ]);

    setSelectedDate("");
    setBlockReason("");
    setMessage("Zi blocată.");
    loadData();
  }

  async function unblockDay(id: string) {
    await supabase.from("blocked_days").delete().eq("id", id);
    setMessage("Zi deblocată.");
    loadData();
  }

  async function updateService(id: string, field: string, value: string) {
    const numericFields = ["duration_minutes", "buffer_minutes", "sort_order"];

    await supabase
      .from("services")
      .update({
        [field]: numericFields.includes(field) ? Number(value) : value,
      })
      .eq("id", id);

    setMessage("Serviciu actualizat.");
    loadData();
  }

  async function toggleService(id: string, isActive: boolean) {
    await supabase
      .from("services")
      .update({ is_active: !isActive })
      .eq("id", id);

    setMessage("Status serviciu actualizat.");
    loadData();
  }

  async function uploadPhoto(e: React.FormEvent) {
    e.preventDefault();

    if (!photoFile) {
      setMessage("Alege o poză.");
      return;
    }

    const fileName = `${Date.now()}-${photoFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("gallery")
      .upload(fileName, photoFile);

    if (uploadError) {
      setMessage("Nu s-a putut încărca poza.");
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    await supabase.from("gallery_photos").insert([
      {
        category: photoCategory,
        title: photoTitle,
        image_url: publicUrlData.publicUrl,
      },
    ]);

    setPhotoTitle("");
    setPhotoFile(null);
    setMessage("Poză încărcată.");
    loadData();
  }

  async function deletePhoto(id: string) {
    if (!confirm("Ștergi poza?")) return;
    await supabase.from("gallery_photos").delete().eq("id", id);
    setMessage("Poză ștearsă.");
    loadData();
  }
async function exportCsv(type: string) {
  window.open(`/api/admin/export?type=${type}`, "_blank");
}

async function saveAppointmentEdit() {
  if (!editAppointment) return;

  const response = await fetch("/api/admin/update-appointment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      appointmentId: editAppointment.id,
      serviceId: editAppointment.service_id,
      appointmentDate: editAppointment.appointment_date,
      appointmentTime: editAppointment.appointment_time,
      notes: editAppointment.notes,
      status: editAppointment.status,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    setMessage(result.error || "Nu s-a putut salva.");
    return;
  }

  setEditAppointment(null);
  setMessage("Programare actualizată.");
  loadData();
}
  async function markNotificationRead(id: string) {
    await supabase
      .from("admin_notifications")
      .update({ is_read: true })
      .eq("id", id);

    loadData();
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesDate = filterDate ? a.appointment_date === filterDate : true;
      const matchesStatus = filterStatus === "all" ? true : a.status === filterStatus;
      const search = searchTerm.toLowerCase().trim();

      const matchesSearch = search
        ? `${a.client_name} ${a.client_phone} ${a.client_email || ""} ${a.services?.name || ""}`
            .toLowerCase()
            .includes(search)
        : true;

      return matchesDate && matchesStatus && matchesSearch;
    });
  }, [appointments, filterDate, filterStatus, searchTerm]);

  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((groups: any, appointment) => {
      const date = appointment.appointment_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(appointment);
      return groups;
    }, {});
  }, [filteredAppointments]);

  const week = thisWeekRange();
  const weekDays = getWeekDays();

  const completedAppointments = appointments.filter((a) => a.status === "completed");

  const revenueToday = completedAppointments
    .filter((a) => a.appointment_date === todayIso())
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const revenueWeek = completedAppointments
    .filter((a) => a.appointment_date >= week.start && a.appointment_date <= week.end)
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const revenueMonth = completedAppointments
    .filter((a) => sameMonth(a.appointment_date, calendarMonth))
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const todayAppointments = appointments.filter((a) => a.appointment_date === todayIso());
  const calendarAppointments = appointments.filter((a) => sameMonth(a.appointment_date, calendarMonth));

  return (
    <main>
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Admin Raluca Beauty</h1>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <div className="admin-actions" style={{ marginTop: 0 }}>
              {tabs.map(([value, label]) => (
                <button key={value} onClick={() => setTab(value)}>
                  {label}
                </button>
              ))}
            </div>

            <button
              className="btn-secondary"
              onClick={async () => {
                await fetch("/api/admin-logout", { method: "POST" });
                window.location.href = "/admin/login";
              }}
            >
              Logout
            </button>
          </div>

          {message && <p className="booking-message">{message}</p>}

          <div className="admin-stats">
            <div className="admin-stat-card"><strong>{todayAppointments.length}</strong><span>Programări azi</span></div>
            <div className="admin-stat-card"><strong>{appointments.filter((a) => a.status === "pending").length}</strong><span>În așteptare</span></div>
            <div className="admin-stat-card"><strong>{clients.length}</strong><span>Cliente</span></div>
            <div className="admin-stat-card"><strong>{revenueMonth} lei</strong><span>Venit lună finalizat</span></div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card"><strong>{revenueToday} lei</strong><span>Venit azi</span></div>
            <div className="admin-stat-card"><strong>{revenueWeek} lei</strong><span>Venit săptămână</span></div>
            <div className="admin-stat-card"><strong>{appointments.filter((a) => a.status === "completed").length}</strong><span>Finalizate</span></div>
            <div className="admin-stat-card"><strong>{appointments.filter((a) => a.status === "no_show").length}</strong><span>No-show</span></div>
          </div>

          {tab === "dashboard" && (
            <>
              <h2 className="hero-title admin-section-title">Azi</h2>

              <div className="admin-grid">
                {todayAppointments.map((appointment) => (
                  <div key={appointment.id} className="admin-card">
                    <div className="admin-card-header">
                      <div>
                        <strong>{appointment.client_name}</strong>
                        <p>{appointment.client_phone}</p>
                      </div>
                      <span className={`status-badge ${appointment.status}`}>
                        {statusLabels[appointment.status] || appointment.status}
                      </span>
                    </div>

                    <p><strong>Ora:</strong> {appointment.appointment_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5) || "?"}</p>
                    <p><strong>Serviciu:</strong> {appointment.services?.name}</p>
                    <p><strong>Preț:</strong> {appointment.services?.price || appointment.total_price || "-"}</p>
                  </div>
                ))}
              </div>

              <h2 className="hero-title admin-section-title">Notificări recente</h2>

              <div className="blocked-list">
                {notifications.slice(0, 8).map((notification) => (
                  <div key={notification.id} className="blocked-card">
                    <div>
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <small>{notification.is_read ? "Citită" : "Nouă"}</small>
                    </div>

                    {!notification.is_read && (
                      <button onClick={() => markNotificationRead(notification.id)}>
                        OK
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "manual" && (
            <>
              <h2 className="hero-title admin-section-title">Adaugă programare manual</h2>

              <form onSubmit={createManualAppointment} className="booking-form">
                <label>
                  Serviciu
                  <select
                    value={manualServiceId}
                    onChange={(e) => {
                      setManualServiceId(e.target.value);
                      setManualTime("");
                    }}
                    required
                  >
                    <option value="">Alege serviciul</option>
                    {services
                      .filter((s) => s.is_active)
                      .map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.category === "nails" ? "Nails" : "Make-up"} — {service.name} ({service.price})
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  Data
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => {
                      setManualDate(e.target.value);
                      setManualTime("");
                    }}
                    required
                  />
                </label>

                <label>
                  Ora
                  <div className="hours-grid">
                    {!manualService && <p>Alege întâi serviciul.</p>}

                    {manualService &&
                      generateSlots(manualService.category).map((slot) => {
                        const disabled = isManualSlotUnavailable(slot);

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={disabled}
                            onClick={() => setManualTime(slot)}
                            className={manualTime === slot ? "hour-btn active" : "hour-btn"}
                          >
                            {disabled ? "Indisponibil" : slot}
                          </button>
                        );
                      })}
                  </div>
                </label>

                <label>
                  Nume clientă
                  <input value={manualName} onChange={(e) => setManualName(e.target.value)} required />
                </label>

                <label>
                  Telefon
                  <input value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} required />
                </label>

                <label>
                  Email opțional
                  <input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} />
                </label>

                <label>
                  Observații
                  <textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} />
                </label>

                <button className="btn-primary" type="submit" disabled={!manualTime}>
                  Adaugă programarea
                </button>
              </form>
            </>
          )}

          {tab === "programari" && (
            <>
              <h2 className="hero-title admin-section-title">Programări</h2>

              <div className="admin-grid" style={{ marginBottom: 22 }}>
                <label>
                  Caută clientă / telefon / serviciu
                  <input
                    className="admin-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Maria, 072..., Semi..."
                  />
                </label>

                <label>
                  Filtrează după dată
                  <input className="admin-input" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                </label>

                <label>
                  Status
                  <select className="admin-input" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">Toate</option>
                    <option value="pending">În așteptare</option>
                    <option value="confirmed">Confirmate</option>
                    <option value="completed">Finalizate</option>
                    <option value="cancelled">Anulate</option>
                    <option value="no_show">No-show</option>
                  </select>
                </label>
              </div>

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
                            {statusLabels[appointment.status] || appointment.status}
                          </span>
                        </div>

                        <div className="admin-details">
                          <p><strong>Ora:</strong> {appointment.appointment_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5) || "?"}</p>
                          <p><strong>Serviciu:</strong> {appointment.services?.name}</p>
                          <p><strong>Categorie:</strong> {appointment.services?.category === "nails" ? "Nails" : "Make-up"}</p>
                          <p><strong>Preț:</strong> {appointment.services?.price || appointment.total_price || "-"}</p>
                          <p><strong>Email:</strong> {appointment.client_email || "-"}</p>
                          {appointment.notes && <p><strong>Observații:</strong> {appointment.notes}</p>}
                        </div>

                        <div className="admin-actions">
                          <button onClick={() => updateStatus(appointment.id, "confirmed")}>Confirmă</button>
                          <button onClick={() => updateStatus(appointment.id, "completed")}>Finalizată</button>
                          <button onClick={() => updateStatus(appointment.id, "cancelled")}>Anulează</button>
                          <button onClick={() => updateStatus(appointment.id, "no_show")}>Nu a venit</button>
                          <button onClick={() => setEditAppointment({ ...appointment })}>
  Editează
</button>
                          <button onClick={() => deleteAppointment(appointment.id)}>Șterge definitiv</button>
                          <a href={`https://wa.me/4${String(appointment.client_phone).replace(/^0/, "")}`} target="_blank">
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === "calendar" && (
            <>
              <h2 className="hero-title admin-section-title">Calendar</h2>

              <label>
                Luna
                <input className="admin-input" type="month" value={calendarMonth} onChange={(e) => setCalendarMonth(e.target.value)} />
              </label>

              <h3 style={{ marginTop: 24 }}>Săptămâna curentă</h3>

              <div className="admin-grid">
                {weekDays.map((day) => {
                  const dayAppointments = appointments.filter((a) => a.appointment_date === day);

                  return (
                    <div key={day} className="admin-card">
                      <strong>{day}</strong>
                      {dayAppointments.length === 0 && <p>Fără programări</p>}
                      {dayAppointments.map((a) => (
                        <p key={a.id}>
                          {a.appointment_time?.slice(0, 5)} • {a.client_name} • {a.services?.name}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>

              <h3 style={{ marginTop: 28 }}>Luna selectată</h3>

              <div className="admin-grid" style={{ marginTop: 18 }}>
                {calendarAppointments.map((a) => (
                  <div key={a.id} className="admin-card">
                    <strong>{a.appointment_date} • {a.appointment_time?.slice(0, 5)}</strong>
                    <p>{a.client_name}</p>
                    <p>{a.services?.name}</p>
                    <span className={`status-badge ${a.status}`}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "cliente" && (
            <>
              <h2 className="hero-title admin-section-title">Cliente / CRM</h2>

              <div className="admin-grid">
                {clients.map((client) => {
                  const clientAppointments = appointments.filter((a) => a.client_phone === client.phone);
                  const completed = clientAppointments.filter((a) => a.status === "completed");
                  const noShows = clientAppointments.filter((a) => a.status === "no_show");
                  const cancelled = clientAppointments.filter((a) => a.status === "cancelled");

                  const spent = completed.reduce(
                    (sum, a) => sum + parsePrice(a.services?.price || a.total_price),
                    0
                  );

                  return (
                    <div key={client.id} className="admin-card">
                      <div className="admin-card-header">
                        <div>
                          <strong>{client.name}</strong>
                          <p>{client.phone}</p>
                          <p>{client.email || "Fără email"}</p>
                        </div>

                        <span className="status-badge confirmed">
                          {clientAppointments.length} programări
                        </span>
                      </div>

                      <p><strong>Total finalizat:</strong> {spent} lei</p>
                      <p><strong>Finalizate:</strong> {completed.length}</p>
                      <p><strong>Anulate:</strong> {cancelled.length}</p>
                      <p><strong>No-show:</strong> {noShows.length}</p>
                      <p><strong>Ultima vizită:</strong> {client.last_visit_date || "-"}</p>

                      <label>
                        Notițe clientă
                        <textarea className="admin-input" defaultValue={client.notes || ""} onBlur={(e) => updateClient(client.id, e.target.value)} />
                      </label>

                      <h3 style={{ marginTop: 18 }}>Istoric</h3>

                      {clientAppointments.map((a) => (
                        <p key={a.id}>
                          {a.appointment_date} • {a.appointment_time?.slice(0, 5)} • {a.services?.name} • {statusLabels[a.status] || a.status}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === "servicii" && (
            <>
              <h2 className="hero-title admin-section-title">Servicii</h2>

              <div className="admin-grid">
                {services.map((service) => (
                  <div key={service.id} className="admin-card">
                    <p><strong>{service.category === "nails" ? "Nails" : "Make-up"}</strong></p>

                    <label>Nume<input className="admin-input" defaultValue={service.name} onBlur={(e) => updateService(service.id, "name", e.target.value)} /></label>
                    <label>Preț<input className="admin-input" defaultValue={service.price} onBlur={(e) => updateService(service.id, "price", e.target.value)} /></label>
                    <label>Durată minute<input className="admin-input" type="number" defaultValue={service.duration_minutes} onBlur={(e) => updateService(service.id, "duration_minutes", e.target.value)} /></label>
                    <label>Buffer minute<input className="admin-input" type="number" defaultValue={service.buffer_minutes || 0} onBlur={(e) => updateService(service.id, "buffer_minutes", e.target.value)} /></label>

                    <div className="admin-actions">
                      <button onClick={() => toggleService(service.id, service.is_active)}>
                        {service.is_active ? "Dezactivează" : "Activează"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === "blocari" && (
            <>
              <h2 className="hero-title admin-section-title">Zile blocate</h2>

              <form onSubmit={blockDay} className="booking-form">
                <label>Data<input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} required /></label>
                <label>Motiv<input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Concediu, zi liberă..." /></label>
                <button className="btn-primary" type="submit">Blochează ziua</button>
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
            </>
          )}

          {tab === "galerie" && (
            <>
              <h2 className="hero-title admin-section-title">Galerie</h2>

              <form onSubmit={uploadPhoto} className="booking-form">
                <label>
                  Categorie
                  <select value={photoCategory} onChange={(e) => setPhotoCategory(e.target.value)}>
                    <option value="nails">Nails</option>
                    <option value="makeup">Make-up</option>
                  </select>
                </label>

                <label>Titlu poză<input value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} /></label>
                <label>Poză<input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} /></label>

                <button className="btn-primary" type="submit">Upload poză</button>
              </form>

              <div className="gallery-admin-grid">
                {photos.map((photo) => (
                  <div key={photo.id} className="gallery-admin-card">
                    <img src={photo.image_url} alt={photo.title || "Galerie"} />
                    <p>{photo.category} • {photo.title || "Fără titlu"}</p>
                    <button onClick={() => deletePhoto(photo.id)}>Șterge</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
