import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const SITE_URL = "https://ralucabeauty.ro";

async function sendEmail(to: string, subject: string, html: string) {
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

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export async function GET() {
  const tomorrow = addDays(1);
  const yesterday = addDays(-1);

  const { data: reminderAppointments } = await supabase
    .from("appointments")
    .select("*, services(name)")
    .eq("appointment_date", tomorrow)
    .in("status", ["pending", "confirmed"])
    .not("client_email", "is", null);

  for (const appointment of reminderAppointments || []) {
    const { data: existingLog } = await supabase
      .from("reminder_logs")
      .select("id")
      .eq("appointment_id", appointment.id)
      .eq("reminder_type", "24h")
      .maybeSingle();

    if (!existingLog) {
      await sendEmail(
        appointment.client_email,
        "Reminder programare - Raluca Beauty 💅",
        `
          <div style="font-family: Arial, sans-serif; line-height:1.6;">
            <h2>Reminder programare 💅</h2>
            <p>Bună, ${appointment.client_name}!</p>
            <p>Îți reamintim că mâine ai programare la Raluca Beauty.</p>
            <p><strong>Serviciu:</strong> ${appointment.services?.name || "-"}</p>
            <p><strong>Data:</strong> ${appointment.appointment_date}</p>
            <p><strong>Ora:</strong> ${appointment.appointment_time?.slice(0, 5)}</p>
            <p>Te așteptăm cu drag!</p>
          </div>
        `
      );

      await supabase.from("reminder_logs").insert([
        {
          appointment_id: appointment.id,
          reminder_type: "24h",
        },
      ]);
    }
  }

  const { data: reviewAppointments } = await supabase
    .from("appointments")
    .select("*, services(name)")
    .eq("appointment_date", yesterday)
    .eq("status", "completed")
    .not("client_email", "is", null);

  for (const appointment of reviewAppointments || []) {
    const { data: existingLog } = await supabase
      .from("reminder_logs")
      .select("id")
      .eq("appointment_id", appointment.id)
      .eq("reminder_type", "review")
      .maybeSingle();

    if (!existingLog) {
      await sendEmail(
        appointment.client_email,
        "Cum a fost experiența ta? 💖",
        `
          <div style="font-family: Arial, sans-serif; line-height:1.6;">
            <h2>Mulțumim că ai ales Raluca Beauty 💖</h2>
            <p>Bună, ${appointment.client_name}!</p>
            <p>Sperăm că ți-a plăcut experiența la noi.</p>
            <p>Dacă vrei, ne poți răspunde la acest email cu o scurtă părere.</p>
            <p>Feedback-ul tău ne ajută enorm.</p>
            <p>Cu drag,<br/>Raluca Beauty</p>
          </div>
        `
      );

      await supabase.from("reminder_logs").insert([
        {
          appointment_id: appointment.id,
          reminder_type: "review",
        },
      ]);
    }
  }

  return NextResponse.json({
    success: true,
    remindersChecked: reminderAppointments?.length || 0,
    reviewsChecked: reviewAppointments?.length || 0,
  });
}
