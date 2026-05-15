import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function sendBookingEmail({
  clientName,
  clientPhone,
  clientEmail,
  serviceName,
  appointmentDate,
  appointmentTime,
  notes,
}: {
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  serviceName: string;
  appointmentDate: string;
  appointmentTime: string;
  notes?: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL || "mihaela_bogza@yahoo.com";

  if (!resendApiKey) {
    console.log("RESEND_API_KEY lipsește. Emailul nu a fost trimis.");
    return;
  }

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Raluca Duran Beauty <programari@ralucabeauty.ro>",
      to: [adminEmail],
      subject: "Programare nouă - Raluca Beauty 💅",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Programare nouă 💅</h2>
          <p>Ai primit o programare nouă pe site.</p>

          <p><strong>Client:</strong> ${clientName}</p>
          <p><strong>Telefon:</strong> ${clientPhone}</p>
          <p><strong>Email:</strong> ${clientEmail || "Nu a fost completat"}</p>
          <p><strong>Serviciu:</strong> ${serviceName}</p>
          <p><strong>Data:</strong> ${appointmentDate}</p>
          <p><strong>Ora:</strong> ${appointmentTime}</p>
          <p><strong>Observații:</strong> ${notes || "Fără observații"}</p>
        </div>
      `,
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

    await sendBookingEmail({
      clientName: client_name,
      clientPhone: client_phone,
      clientEmail: client_email,
      serviceName,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      notes,
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
