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
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function parsePrice(price: any) {
  if (!price) return 0;
  const cleaned = String(price).replace(/[^\d.,]/g, "").replace(",", ".");
  return Number(cleaned) || 0;
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

  if (!resendApiKey) {
    console.log("RESEND_API_KEY lipsește.");
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
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

  const result = await response.json();

  if (!response.ok) {
    console.error("Resend error:", result);
  }
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
      return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
    }

    const { data: service, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .eq("id", service_id)
      .single();

    if (serviceError || !service) {
      return NextResponse.json(
        { error: "Serviciul nu a fost găsit." },
        { status: 404 }
      );
    }

    const duration = Number(service.duration_minutes || 60);
    const buffer = Number(service.buffer_minutes || 15);

    const startMinutes = toMinutes(appointment_time);
    const endMinutes = startMinutes + duration + buffer;
    const endTime = toTime(endMinutes);

    const { data: blockedDays } = await supabase
      .from("blocked_days")
      .select("*")
      .eq("blocked_date", appointment_date);

    if (blockedDays && blockedDays.length > 0) {
      return NextResponse.json(
        { error: "Ziua selectată este indisponibilă." },
        { status: 409 }
      );
    }

    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_time,
        end_time,
        status,
        services (
          duration_minutes,
          buffer_minutes
        )
      `)
      .eq("appointment_date", appointment_date)
      .neq("status", "cancelled");

    const hasOverlap = (existingAppointments || []).some((appointment: any) => {
      const existingStart = toMinutes(appointment.appointment_time);
      const existingDuration = Number(
        appointment.services?.duration_minutes || 60
      );
      const existingBuffer = Number(appointment.services?.buffer_minutes || 15);

      const existingEnd = appointment.end_time
        ? toMinutes(appointment.end_time)
        : existingStart + existingDuration + existingBuffer;

      return startMinutes < existingEnd && endMinutes > existingStart;
    });

    if (hasOverlap) {
      return NextResponse.json(
        { error: "Intervalul ales se suprapune cu altă programare." },
        { status: 409 }
      );
    }

    let clientId: string | null = null;

    const { data: existingClient } = await supabase
      .from("clients")
      .select("*")
      .eq("phone", client_phone)
      .maybeSingle();

    const servicePrice = parsePrice(service.price);

    if (existingClient) {
      clientId = existingClient.id;

      await supabase
        .from("clients")
        .update({
          name: client_name,
          email: client_email || existingClient.email,
          visit_count: Number(existingClient.visit_count || 0) + 1,
          total_spent: Number(existingClient.total_spent || 0) + servicePrice,
          last_visit_date: appointment_date,
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
            visit_count: 1,
            total_spent: servicePrice,
            last_visit_date: appointment_date,
          },
        ])
        .select()
        .single();

      clientId = newClient?.id || null;
    }

    const cancelToken = makeToken();
    const rescheduleToken = makeToken();

    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          service_id,
          client_id: clientId,
          client_name,
          client_phone,
          client_email: client_email || null,
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
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const serviceName = service.name || "serviciu";
    const adminEmail = process.env.ADMIN_EMAIL || "mihaela_bogza@yahoo.com";

    await supabase.from("admin_notifications").insert([
      {
        title: "Programare nouă",
        message: `${client_name} a făcut o programare pentru ${serviceName} pe ${appointment_date} la ${appointment_time}.`,
        type: "booking",
        is_read: false,
      },
    ]);

    await sendEmail({
      to: adminEmail,
      subject: "Programare nouă - Raluca Beauty 💅",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Programare nouă 💅</h2>
          <p>Ai primit o programare nouă pe site.</p>

          <p><strong>Client:</strong> ${client_name}</p>
          <p><strong>Telefon:</strong> ${client_phone}</p>
          <p><strong>Email:</strong> ${client_email || "Nu a fost completat"}</p>
          <p><strong>Serviciu:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${appointment_date}</p>
          <p><strong>Ora:</strong> ${appointment_time}</p>
          <p><strong>Final estimat:</strong> ${endTime}</p>
          <p><strong>Preț:</strong> ${service.price || "-"}</p>
          <p><strong>Observații:</strong> ${notes || "Fără observații"}</p>

          <p>
            <a href="${SITE_URL}/admin">Deschide admin</a>
          </p>
        </div>
      `,
    });

    if (client_email) {
      await sendEmail({
        to: client_email,
        subject: "Programarea ta la Raluca Beauty 💅",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2>Bună, ${client_name}! 💖</h2>

            <p>Programarea ta a fost înregistrată cu succes.</p>

            <p><strong>Serviciu:</strong> ${serviceName}</p>
            <p><strong>Data:</strong> ${appointment_date}</p>
            <p><strong>Ora:</strong> ${appointment_time}</p>
            <p><strong>Durată estimată:</strong> ${duration} minute</p>
            <p><strong>Preț:</strong> ${service.price || "-"}</p>

            <p>Dacă ai nevoie să modifici programarea, ne poți contacta telefonic.</p>

            <p>Te așteptăm cu drag,<br/>Raluca Beauty</p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      success: true,
      appointment: data,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "A apărut o eroare." }, { status: 500 });
  }
}
