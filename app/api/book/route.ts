import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendPushNotification(title: string, message: string) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;

  if (!appId || !apiKey) {
    return;
  }

  await fetch("https://api.onesignal.com/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Key ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      included_segments: ["Subscribed Users"],
      headings: {
        en: title,
      },
      contents: {
        en: message,
      },
      url: "https://raluca-duran-nails.vercel.app/admin",
    }),
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
    const serviceName = appointment?.services?.name || "serviciu";

    const notificationTitle = "Programare nouă";
    const notificationMessage = `${client_name} • ${serviceName} • ${appointment_date} la ${appointment_time}`;

    await supabase.from("admin_notifications").insert([
      {
        title: notificationTitle,
        message: notificationMessage,
        type: "booking",
        is_read: false,
      },
    ]);

    await sendPushNotification(notificationTitle, notificationMessage);

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch {
    return NextResponse.json({ error: "A apărut o eroare." }, { status: 500 });
  }
}
