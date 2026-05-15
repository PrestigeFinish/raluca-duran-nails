import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendBookingPush({
  clientName,
  serviceName,
  appointmentDate,
  appointmentTime,
}: {
  clientName: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  const appId = process.env.ONESIGNAL_APP_ID;
  const apiKey = process.env.ONESIGNAL_API_KEY;
  const adminSubscriptionId = process.env.ONESIGNAL_ADMIN_SUBSCRIPTION_ID;

  if (!appId || !apiKey || !adminSubscriptionId) {
    console.log("OneSignal env lipsă. Notificarea nu a fost trimisă.");
    return;
  }

  await fetch("https://onesignal.com/api/v1/notifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      include_subscription_ids: [adminSubscriptionId],
      headings: {
        en: "Programare nouă 💅",
        ro: "Programare nouă 💅",
      },
      contents: {
        en: `${clientName} s-a programat la ${serviceName} pe ${appointmentDate} la ${appointmentTime}.`,
        ro: `${clientName} s-a programat la ${serviceName} pe ${appointmentDate} la ${appointmentTime}.`,
      },
      url: "https://cheerful-griffin-245b84.netlify.app/admin",
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

    await supabase.from("admin_notifications").insert([
      {
        title: "Programare nouă",
        message: `${client_name} a făcut o programare pentru ${serviceName} pe ${appointment_date} la ${appointment_time}.`,
        type: "booking",
        is_read: false,
      },
    ]);

    await sendBookingPush({
      clientName: client_name,
      serviceName,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
    });

    return NextResponse.json({
      success: true,
      appointment,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "A apărut o eroare." }, { status: 500 });
  }
}
