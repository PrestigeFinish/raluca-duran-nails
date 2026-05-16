import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function toMinutes(time: string) {
  const [h, m] = time.slice(0, 5).split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

async function findAppointment(token: string) {
  const { data } = await supabase
    .from("appointments")
    .select(`
      *,
      services (
        id,
        name,
        price,
        duration_minutes,
        buffer_minutes
      )
    `)
    .or(`cancel_token.eq.${token},reschedule_token.eq.${token}`)
    .maybeSingle();

  return data;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token lipsă." }, { status: 400 });
  }

  const appointment = await findAppointment(token);

  if (!appointment) {
    return NextResponse.json(
      { error: "Programarea nu a fost găsită." },
      { status: 404 }
    );
  }

  return NextResponse.json({ appointment });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, token, appointment_date, appointment_time } = body;

    if (!action || !token) {
      return NextResponse.json({ error: "Date lipsă." }, { status: 400 });
    }

    const appointment = await findAppointment(token);

    if (!appointment) {
      return NextResponse.json(
        { error: "Programarea nu a fost găsită." },
        { status: 404 }
      );
    }

    if (appointment.status === "cancelled") {
      return NextResponse.json(
        { error: "Programarea este deja anulată." },
        { status: 409 }
      );
    }

    if (action === "cancel") {
      await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        })
        .eq("id", appointment.id);

      await supabase.from("admin_notifications").insert([
        {
          title: "Programare anulată",
          message: `${appointment.client_name} a anulat programarea din ${appointment.appointment_date} la ${appointment.appointment_time}.`,
          type: "booking",
          is_read: false,
        },
      ]);

      return NextResponse.json({ success: true });
    }

    if (action === "reschedule") {
      if (!appointment_date || !appointment_time) {
        return NextResponse.json(
          { error: "Alege data și ora nouă." },
          { status: 400 }
        );
      }

      const duration = Number(appointment.services?.duration_minutes || 60);
      const buffer = Number(appointment.services?.buffer_minutes || 15);

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
        .neq("status", "cancelled")
        .neq("id", appointment.id);

      const hasOverlap = (existingAppointments || []).some((a: any) => {
        const existingStart = toMinutes(a.appointment_time);
        const existingDuration = Number(a.services?.duration_minutes || 60);
        const existingBuffer = Number(a.services?.buffer_minutes || 15);

        const existingEnd = a.end_time
          ? toMinutes(a.end_time)
          : existingStart + existingDuration + existingBuffer;

        return startMinutes < existingEnd && endMinutes > existingStart;
      });

      if (hasOverlap) {
        return NextResponse.json(
          { error: "Intervalul ales este deja ocupat." },
          { status: 409 }
        );
      }

      await supabase
        .from("appointments")
        .update({
          appointment_date,
          appointment_time,
          end_time: endTime,
          status: "pending",
        })
        .eq("id", appointment.id);

      await supabase.from("admin_notifications").insert([
        {
          title: "Programare reprogramată",
          message: `${appointment.client_name} a mutat programarea pe ${appointment_date} la ${appointment_time}.`,
          type: "booking",
          is_read: false,
        },
      ]);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Acțiune invalidă." }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "A apărut o eroare." }, { status: 500 });
  }
}
