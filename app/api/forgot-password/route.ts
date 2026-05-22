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

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email lipsă." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: "https://ralucabeauty.ro/reset-password",
      },
    });

    if (error || !data?.properties?.action_link) {
      return NextResponse.json(
        { error: "Nu s-a putut genera linkul." },
        { status: 500 }
      );
    }

    await sendEmail({
      to: email,
      subject: "Resetează parola — Raluca Beauty 💖",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;">
          <h2>Resetare parolă 💖</h2>

          <p>Bună!</p>

          <p>Ai cerut resetarea parolei pentru contul tău Raluca Beauty.</p>

          <p>
            <a href="${data.properties.action_link}"
               style="display:inline-block;padding:12px 20px;background:#b8826b;color:white;text-decoration:none;border-radius:8px;">
              Resetează parola
            </a>
          </p>

          <p>Dacă nu ai cerut asta, ignoră acest email.</p>

          <p>Te așteptăm cu drag 💅</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "A apărut o eroare." },
      { status: 500 }
    );
  }
}
