import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = "https://ralucabeauty.ro";

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

function makeToken() {
  return crypto.randomUUID();
}

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || !to) return;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Raluca Duran Beauty <programari@ralucabeauty.ro>",
      to: [to],
      subject,
      html,
    }),
  });
}

async function sendAdminBookingEmail({
  clientName,
  clientPhone,
  clientEmail,
  serviceName,
  appointmentDate,
  appointmentTime,
  price,
}: any) {
  const adminEmail = process.env.ADMIN_EMAIL || "mihaela_bogza@yahoo.com";

  await sendEmail({
    to: adminEmail,
    subject: "Programare nouă - Raluca Beauty 💅",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">
        <h2>Programare nouă 💅</h2>
        <p><strong>Clientă:</strong> ${clientName}</p>
        <p><strong>Telefon:</strong> ${clientPhone}</p>
        <p><strong>Email:</strong> ${clientEmail || "-"}</p>
        <p><strong>Serviciu:</strong> ${serviceName}</p>
        <p><strong>Data:</strong> ${appointmentDate}</p>
        <p><strong>Ora:</strong> ${appointmentTime}</p>
        <p><strong>Preț:</strong> ${price || "-"}</p>
      </div>
    `,
  });
}

async function sendClientBookingEmail({
  clientEmail,
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
  cancelToken,
  rescheduleToken,
}: any) {
  if (!clientEmail) return;

  await sendEmail({
    to: clientEmail,
    subject: "Programarea ta la Raluca Beauty 💖",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;">
        <h2>Programare confirmată 💖</h2>

        <p>Bună, ${clientName}!</p>

        <p>Programarea ta a fost înregistrată.</p>

        <p><strong>Serviciu:</strong> ${serviceName}</p>
        <p><strong>Data:</strong> ${appointmentDate}</p>
        <p><strong>Ora:</strong> ${appointmentTime}</p>

        <p>Gestionează programarea:</p>

        <p>
          <a href="${SITE_URL}/gestioneaza-programarea?token=${cancelToken}"
             style="display:inline-block;padding:12px 20px;background:#b8826b;color:white;text-decoration:none;border-radius:8px;">
            Anulează
          </a>
        </p>

        <p>
          <a href="${SITE_URL}/gestioneaza-programarea?token=${rescheduleToken}"
             style="display:inline-block;padding:12px 20px;background:#222;color:white;text-decoration:none;border-radius:8px;">
            Reprogramează
          </a>
        </p>

        <p>Te așteptăm cu drag 💅</p>
      </div>
    `,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      service_id,
      client_name,
      client_phone,
      client_email,
      appointment_date,
      appointment_time,
      notes,
    } = body;

    if (
      !service_id ||
      !client_name ||
      !client_phone ||
      !appointment_date ||
      !appointment_time
    ) {
      return NextResponse.json(
        { error: "Date incomplete." },
        { status: 400 }
      );
    }

    const { data: blockedDays } = await supabase
      .from("blocked_days")
      .select("*")
      .eq("blocked_date", appointment_date);

    if (blockedDays && blockedDays.length > 0) {
      return NextResponse.json(
        { error: "Zi indisponibilă." },
        { status: 409 }
      );
    }

    const { data: service } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .maybeSingle();

    if (!service) {
      return NextResponse.json(
        { error: "Serviciul nu există." },
        { status: 404 }
      );
    }

    const duration = Number(service.duration_minutes || 60);
    const buffer = Number(service.buffer_minutes || 0);

    const start = toMinutes(appointment_time);
    const end = start + duration + buffer;
    const endTime = toTime(end);

    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", appointment_date)
      .neq("status", "cancelled");

    const { data: allServices } = await supabase
      .from("services")
      .select("*");

    const servicesMap = new Map((allServices || []).map((s) => [s.id, s]));

    const hasOverlap = (existingAppointments || []).some((appointment: any) => {
      const existingService = servicesMap.get(appointment.service_id);

      const existingStart = toMinutes(appointment.appointment_time);

      const existingDuration = Number(
        existingService?.duration_minutes || 60
      );

      const existingBuffer = Number(
        existingService?.buffer_minutes || 0
      );

      const existingEnd = appointment.end_time
        ? toMinutes(appointment.end_time)
        : existingStart + existingDuration + existingBuffer;

      return start < existingEnd && end > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Intervalul este deja ocupat." },
        { status: 409 }
      );
    }

    let clientId = null;

    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", client_phone)
      .maybeSingle();

    if (existingClient) {
      clientId = existingClient.id;

      await supabase
        .from("clients")
        .update({
          name: client_name,
          email: client_email || existingClient.email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingClient.id);
    } else {
      const { data: newClient } = await supabase
        .from("clients")
        .insert([
          {
            name: client_name,
            phone: client_phone,
            email: client_email || null,
          },
        ])
        .select()
        .single();

      clientId = newClient?.id || null;
    }

    const cancelToken = makeToken();
    const rescheduleToken = makeToken();

    const { data: insertedAppointment, error } = await supabase
      .from("appointments")
      .insert([
        {
          service_id,
          client_id: clientId,
          client_name,
          client_phone,
          client_email,
          appointment_date,
          appointment_time,
          end_time: endTime,
          total_price: service.price,
          notes,
          status: "pending",
          cancel_token: cancelToken,
          reschedule_token: rescheduleToken,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    await supabase.from("admin_notifications").insert([
      {
        title: "Programare nouă",
        message: `${client_name} a făcut o programare pentru ${service.name} pe ${appointment_date} la ${appointment_time}.`,
        type: "booking",
        is_read: false,
      },
    ]);

    await sendAdminBookingEmail({
      clientName: client_name,
      clientPhone: client_phone,
      clientEmail: client_email,
      serviceName: service.name,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      price: service.price,
    });

    await sendClientBookingEmail({
      clientEmail: client_email,
      clientName: client_name,
      serviceName: service.name,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      cancelToken,
      rescheduleToken,
    });

    return NextResponse.json({
      success: true,
      appointment: insertedAppointment,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "A apărut o eroare." },
      { status: 500 }
    );
  }
}
