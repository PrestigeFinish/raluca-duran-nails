import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

function toMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      appointmentId,
      serviceId,
      appointmentDate,
      appointmentTime,
      notes,
      status,
    } = body;

    if (!appointmentId || !serviceId || !appointmentDate || !appointmentTime) {
      return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
    }

    const { data: oldAppointment } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .maybeSingle();

    const { data: service } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (!service) {
      return NextResponse.json(
        { error: "Serviciul nu există." },
        { status: 404 }
      );
    }

    const start = toMinutes(appointmentTime);
    const end =
      start +
      Number(service.duration_minutes || 60) +
      Number(service.buffer_minutes || 0);

    const endTime = toTime(end);

    const { data: existingAppointments } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", appointmentDate)
      .neq("id", appointmentId)
      .neq("status", "cancelled");

    const { data: allServices } = await supabase.from("services").select("*");
    const servicesMap = new Map((allServices || []).map((s) => [s.id, s]));

    const overlap = (existingAppointments || []).some((appointment: any) => {
      const existingService = servicesMap.get(appointment.service_id);
      const existingStart = toMinutes(appointment.appointment_time);

      const existingEnd = appointment.end_time
        ? toMinutes(appointment.end_time)
        : existingStart +
          Number(existingService?.duration_minutes || 60) +
          Number(existingService?.buffer_minutes || 0);

      return start < existingEnd && end > existingStart;
    });

    if (overlap) {
      return NextResponse.json({ error: "Interval ocupat." }, { status: 409 });
    }

    await supabase
      .from("appointments")
      .update({
        service_id: serviceId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        end_time: endTime,
        total_price: service.price,
        notes,
        status,
      })
      .eq("id", appointmentId);

    const dateChanged =
      oldAppointment &&
      (oldAppointment.appointment_date !== appointmentDate ||
        oldAppointment.appointment_time?.slice(0, 5) !== appointmentTime?.slice(0, 5) ||
        oldAppointment.service_id !== serviceId);

    if (dateChanged && oldAppointment?.client_email) {
      await sendEmail({
        to: oldAppointment.client_email,
        subject: "Programarea ta a fost actualizată — Raluca Beauty 💖",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;">
            <h2>Programarea ta a fost actualizată 💖</h2>

            <p>Bună, ${oldAppointment.client_name}!</p>

            <p>Programarea ta la Raluca Beauty a fost modificată.</p>

            <p><strong>Serviciu:</strong> ${service.name}</p>
            <p><strong>Data nouă:</strong> ${appointmentDate}</p>
            <p><strong>Ora nouă:</strong> ${appointmentTime}</p>

            <p>Dacă ai întrebări, ne poți contacta direct.</p>

            <p>Te așteptăm cu drag 💅</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
