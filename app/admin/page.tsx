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
  no_show: "Neprezentată",
};

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

export default function AdminPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [blockedDays, setBlockedDays] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const [tab, setTab] = useState("programari");
  const [filterDate, setFilterDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(todayIso().slice(0, 7));

  const [selectedDate, setSelectedDate] = useState("");
  const [blockReason, setBlockReason] = useState("");

  const [photoCategory, setPhotoCategory] = useState("nails");
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  async function loadData() {
    const { data: appointmentData } = await supabase
      .from("appointments")
      .select(`
        *,
        services (
          name,
          category,
          price,
          duration_minutes,
          buffer_minutes
        )
      `)
      .order("appointment_date", { ascending: false })
      .order("appointment_time", { ascending: true });

    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });

    const { data: serviceData } = await supabase
      .from("services")
      .select("*")
      .order("category")
      .order("name");

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

    setAppointments(appointmentData || []);
    setClients(clientData || []);
    setServices(serviceData || []);
    setBlockedDays(blockedData || []);
    setPhotos(photosData || []);
    setNotifications(notificationsData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateStatus(id: string, status: string) {
    const extra: any = { status };

    if (status === "confirmed") extra.confirmed_at = new Date().toISOString();
    if (status === "completed") extra.completed_at = new Date().toISOString();
    if (status === "cancelled") extra.cancelled_at = new Date().toISOString();

    await supabase.from("appointments").update(extra).eq("id", id);
    setMessage("Status actualizat.");
    loadData();
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Sigur vrei să ștergi programarea?")) return;
    await supabase.from("appointments").delete().eq("id", id);
    setMessage("Programare ștearsă.");
    loadData();
  }

  async function updateClient(id: string, notes: string) {
    await supabase.from("clients").update({ notes, updated_at: new Date().toISOString() }).eq("id", id);
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
      .update({ [field]: numericFields.includes(field) ? Number(value) : value })
      .eq("id", id);

    setMessage("Serviciu actualizat.");
    loadData();
  }

  async function toggleService(id: string, isActive: boolean) {
    await supabase.from("services").update({ is_active: !isActive }).eq("id", id);
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

  async function markNotificationRead(id: string) {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    loadData();
  }

  const filteredAppointments = useMemo(() => {
    if (!filterDate) return appointments;
    return appointments.filter((a) => a.appointment_date === filterDate);
  }, [appointments, filterDate]);

  const groupedAppointments = useMemo(() => {
    return filteredAppointments.reduce((groups: any, appointment) => {
      const date = appointment.appointment_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(appointment);
      return groups;
    }, {});
  }, [filteredAppointments]);

  const week = thisWeekRange();

  const revenueToday = appointments
    .filter((a) => a.appointment_date === todayIso() && a.status !== "cancelled")
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const revenueWeek = appointments
    .filter((a) => a.appointment_date >= week.start && a.appointment_date <= week.end && a.status !== "cancelled")
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const revenueMonth = appointments
    .filter((a) => sameMonth(a.appointment_date, calendarMonth) && a.status !== "cancelled")
    .reduce((sum, a) => sum + parsePrice(a.services?.price || a.total_price), 0);

  const calendarAppointments = appointments.filter((a) => sameMonth(a.appointment_date, calendarMonth));

  return (
    <main>
      <section className="section" style={{ paddingTop: "140px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Admin Raluca Beauty</h1>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 22 }}>
            <div className="admin-actions" style={{ marginTop: 0 }}>
              {["programari", "calendar", "cliente", "servicii", "blocari", "galerie"].map((item) => (
                <button key={item} onClick={() => setTab(item)}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
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
            <div className="admin-stat-card">
              <strong>{appointments.filter((a) => a.appointment_date === todayIso()).length}</strong>
              <span>Azi</span>
            </div>
            <div className="admin-stat-card">
              <strong>{appointments.filter((a) => a.status === "pending").length}</strong>
              <span>În așteptare</span>
            </div>
            <div className="admin-stat-card">
              <strong>{clients.length}</strong>
              <span>Cliente</span>
            </div>
            <div className="admin-stat-card">
              <strong>{revenueMonth} lei</strong>
              <span>Estimare lună</span>
            </div>
          </div>

          <div className="admin-stats">
            <div className="admin-stat-card"><strong>{revenueToday} lei</strong><span>Venit azi</span></div>
            <div className="admin-stat-card"><strong>{revenueWeek} lei</strong><span>Venit săptămână</span></div>
            <div className="admin-stat-card"><strong>{revenueMonth} lei</strong><span>Venit lună</span></div>
            <div className="admin-stat-card"><strong>{notifications.filter((n) => !n.is_read).length}</strong><span>Notificări noi</span></div>
          </div>

          {tab === "programari" && (
            <>
              <h2 className="hero-title admin-section-title">Programări</h2>

              <div style={{ marginBottom: 20 }}>
                <label>
                  Filtrează după dată
                  <input className="admin-input" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
                </label>
                {filterDate && (
                  <button className="btn-secondary" style={{ marginTop: 10 }} onClick={() => setFilterDate("")}>
                    Arată toate
                  </button>
                )}
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
                          <button onClick={() => deleteAppointment(appointment.id)}>Șterge</button>
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
              <h2 className="hero-title admin-section-title">Calendar lunar</h2>

              <input className="admin-input" type="month" value={calendarMonth} onChange={(e) => setCalendarMonth(e.target.value)} />

              <div className="admin-grid" style={{ marginTop: 24 }}>
                {calendarAppointments.map((a) => (
                  <div key={a.id} className="admin-card">
                    <strong>{a.appointment_date} • {a.appointment_time?.slice(0, 5)}</strong>
                    <p>{a.client_name}</p>
                    <p>{a.services?.name}</p>
                    <span className={`status-badge ${a.status}`}>{statusLabels[a.status] || a.status}</span>
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

                  return (
                    <div key={client.id} className="admin-card">
                      <div className="admin-card-header">
                        <div>
                          <strong>{client.name}</strong>
                          <p>{client.phone}</p>
                          <p>{client.email || "Fără email"}</p>
                        </div>
                        <span className="status-badge confirmed">{client.visit_count || 0} vizite</span>
                      </div>

                      <p><strong>Total cheltuit:</strong> {client.total_spent || 0} lei</p>
                      <p><strong>Ultima vizită:</strong> {client.last_visit_date || "-"}</p>

                      <label>
                        Notițe clientă
                        <textarea
                          className="admin-input"
                          defaultValue={client.notes || ""}
                          onBlur={(e) => updateClient(client.id, e.target.value)}
                        />
                      </label>

                      <h3 style={{ marginTop: 18 }}>Istoric</h3>
                      {clientAppointments.map((a) => (
                        <p key={a.id}>
                          {a.appointment_date} • {a.appointment_time?.slice(0, 5)} • {a.services?.name}
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
                    <label>Buffer minute<input className="admin-input" type="number" defaultValue={service.buffer_minutes || 15} onBlur={(e) => updateService(service.id, "buffer_minutes", e.target.value)} /></label>

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

          <aside className="admin-sidebar" style={{ marginTop: 30 }}>
            <h2 className="hero-title admin-section-title">Notificări</h2>
            <div className="blocked-list">
              {notifications.slice(0, 10).map((notification) => (
                <div key={notification.id} className="blocked-card">
                  <div>
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{notification.is_read ? "Citită" : "Nouă"}</small>
                  </div>

                  {!notification.is_read && (
                    <button onClick={() => markNotificationRead(notification.id)}>OK</button>
                  )}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
