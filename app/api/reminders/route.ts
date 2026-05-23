import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
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

function tomorrowIso() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export async function GET() {
  try {
    const date = tomorrowIso();

    const { data: appointments, error } = await supabase
      .from("appointments")
      .select(`
        *,
        services (
          name
        )
      `)
      .eq("appointment_date", date)
      .in("status", ["pending", "confirmed"])
      .is("reminder_sent_at", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    for (const appointment of appointments || []) {
      if (!appointment.client_email) continue;

      await sendEmail({
        to: appointment.client_email,
        subject: "Reminder programare — Raluca Beauty 💖",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;">
            <h2>Reminder programare 💖</h2>

            <p>Bună, ${appointment.client_name || ""}!</p>

            <p>Îți reamintim că mâine ai programare la Raluca Beauty.</p>

            <p><strong>Serviciu:</strong> ${appointment.services?.name || "Programare"}</p>
            <p><strong>Data:</strong> ${appointment.appointment_date}</p>
            <p><strong>Ora:</strong> ${appointment.appointment_time?.slice(0, 5)}</p>

            <p>Te așteptăm cu drag 💅</p>
          </div>
        `,
      });

      await supabase
        .from("appointments")
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq("id", appointment.id);
    }

    return NextResponse.json({
      success: true,
      sent: appointments?.length || 0,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Reminder failed." }, { status: 500 });
  }
}
