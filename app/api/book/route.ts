import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

    if (!service_id || !client_name || !client_phone || !appointment_date || !appointment_time) {
      return NextResponse.json({ error: "Date incomplete." }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("appointments")
      .select("id")
      .eq("appointment_date", appointment_date)
      .eq("appointment_time", appointment_time)
      .neq("status", "cancelled");

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "Ora selectată este deja ocupată." },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from("appointments")
      .insert([
        {
          service_id,
          client_name,
          client_phone,
          client_email,
          appointment_date,
          appointment_time,
          notes,
          status: "pending",
        },
      ])
      .select(`
        *,
        services (
          name,
          category,
          price,
          duration_minutes
        )
      `);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const appointment = data?.[0];

    await supabase.from("admin_notifications").insert([
      {
        title: "Programare nouă",
        message: `${client_name} a făcut o programare pentru ${appointment?.services?.name || "serviciu"} pe ${appointment_date} la ${appointment_time}.`,
        type: "booking",
        is_read: false,
      },
    ]);

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch {
    return NextResponse.json({ error: "A apărut o eroare." }, { status: 500 });
  }
}
