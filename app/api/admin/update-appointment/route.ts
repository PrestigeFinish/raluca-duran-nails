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

    const { data: service } = await supabase
      .from("services")
      .select("*")
      .eq("id", serviceId)
      .maybeSingle();

    if (!service) {
      return NextResponse.json({ error: "Serviciul nu există." }, { status: 404 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
