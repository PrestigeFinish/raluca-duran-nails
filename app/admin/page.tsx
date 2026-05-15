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
  const [services, setServices] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [message, setMessage] = useState("");

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
          duration_minutes
        )
      `)
      .order("appointment_date", { ascending: true })
      .order("appointment_time", { ascending: true });

    const { data: blockedData } = await supabase
      .from("blocked_days")
      .select("*")
      .order("blocked_date", { ascending: true });

    const { data: servicesData } = await supabase
      .from("services")
      .select("*")
      .order("category")
      .order("name");

    const { data: photosData } = await supabase
      .from("gallery_photos")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: notificationsData } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false });

    setAppointments(appointmentData || []);
    setBlockedDays(blockedData || []);
    setServices(servicesData || []);
    setPhotos(photosData || []);
    setNotifications(notificationsData || []);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("appointments").update({ status }).eq("id", id);
    setMessage("Status actualizat.");
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
    await supabase.from("services").update({ [field]: value }).eq("id", id);
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
    await supabase.from("gallery_photos").delete().eq("id", id);
    setMessage("Poză ștearsă din galerie.");
    loadData();
  }

  async function markNotificationRead(id: string) {
    await supabase.from("admin_notifications").update({ is_read: true }).eq("id", id);
    loadData();
  }

  const groupedAppointments = useMemo(() => {
    return appointments.reduce((groups: any, appointment) => {
      const date = appointment.appointment_date;
      if (!groups[date]) groups[date] = [];
      groups[date].push(appointment);
      return groups;
    }, {});
  }, [appointments]);

  return (
    <main>
      <section className="section" style={{ paddingTop: "150px" }}>
        <div className="container">
          <h1 className="hero-title section-title">Agenda Raluca Duran</h1>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
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
              <strong>{appointments.length}</strong>
              <span>Total programări</span>
            </div>
            <div className="admin-stat-card">
              <strong>{appointments.filter((a) => a.status === "pending").length}</strong>
              <span>În așteptare</span>
            </div>
            <div className="admin-stat-card">
              <strong>{appointments.filter((a) => a.status === "confirmed").length}</strong>
              <span>Confirmate</span>
            </div>
            <div className="admin-stat-card">
              <strong>{notifications.filter((n) => !n.is_read).length}</strong>
              <span>Notificări noi</span>
            </div>
          </div>

          <div className="admin-panel-layout">
            <div>
              <h2 className="hero-title admin-section-title">Programări</h2>

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
                          <p><strong>Ora:</strong> {appointment.appointment_time?.slice(0, 5)}</p>
                          <p>
                            <strong>Serviciu:</strong>{" "}
                            {appointment.services?.category === "nails" ? "Nails" : "Make-up"} —{" "}
                            {appointment.services?.name}
                          </p>
                          <p><strong>Preț:</strong> {appointment.services?.price}</p>
                          <p><strong>Durată:</strong> {appointment.services?.duration_minutes} min</p>
                          {appointment.client_email && <p><strong>Email:</strong> {appointment.client_email}</p>}
                          {appointment.notes && <p><strong>Observații:</strong> {appointment.notes}</p>}
                        </div>

                        <div className="admin-actions">
                          <button onClick={() => updateStatus(appointment.id, "confirmed")}>Confirmă</button>
                          <button onClick={() => updateStatus(appointment.id, "completed")}>Finalizată</button>
                          <button onClick={() => updateStatus(appointment.id, "cancelled")}>Anulează</button>
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

              <h2 className="hero-title admin-section-title">Servicii</h2>

              <div className="admin-grid">
                {services.map((service) => (
                  <div key={service.id} className="admin-card">
                    <p><strong>{service.category === "nails" ? "Nails" : "Make-up"}</strong></p>

                    <input
                      className="admin-input"
                      defaultValue={service.name}
                      onBlur={(e) => updateService(service.id, "name", e.target.value)}
                    />

                    <input
                      className="admin-input"
                      defaultValue={service.price}
                      onBlur={(e) => updateService(service.id, "price", e.target.value)}
                    />

                    <input
                      className="admin-input"
                      type="number"
                      defaultValue={service.duration_minutes}
                      onBlur={(e) => updateService(service.id, "duration_minutes", e.target.value)}
                    />

                    <div className="admin-actions">
                      <button onClick={() => toggleService(service.id, service.is_active)}>
                        {service.is_active ? "Dezactivează" : "Activează"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="hero-title admin-section-title">Galerie</h2>

              <form onSubmit={uploadPhoto} className="booking-form">
                <label>
                  Categorie
                  <select value={photoCategory} onChange={(e) => setPhotoCategory(e.target.value)}>
                    <option value="nails">Nails</option>
                    <option value="makeup">Make-up</option>
                  </select>
                </label>

                <label>
                  Titlu poză
                  <input value={photoTitle} onChange={(e) => setPhotoTitle(e.target.value)} />
                </label>

                <label>
                  Poză
                  <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
                </label>

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
            </div>

            <aside className="admin-sidebar">
              <h2 className="hero-title admin-section-title">Notificări</h2>

              <div className="blocked-list">
                {notifications.map((notification) => (
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

              <h2 className="hero-title admin-section-title" style={{ marginTop: "32px" }}>
                Zile blocate
              </h2>

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
