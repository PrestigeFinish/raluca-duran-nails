import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD lipsește în Netlify." },
      { status: 500 }
    );
  }

  const cleanPassword = String(password || "").trim();
  const cleanAdminPassword = String(adminPassword || "").trim();

  if (cleanPassword !== cleanAdminPassword) {
    return NextResponse.json(
      {
        error: "Parolă greșită.",
        debug: {
          typedLength: cleanPassword.length,
          envLength: cleanAdminPassword.length,
        },
      },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_auth", "true", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
