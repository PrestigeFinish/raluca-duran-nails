import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function csvEscape(value: any) {
  if (value === null || value === undefined) return "";
  return `"${String(value).replace(/"/g, '""')}"`;
}

function makeCsv(rows: any[], headers: string[]) {
  return [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "appointments") {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false });

    const csv = makeCsv(data || [], [
      "client_name",
      "client_phone",
      "client_email",
      "appointment_date",
      "appointment_time",
      "end_time",
      "status",
      "total_price",
      "notes",
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=programari.csv",
      },
    });
  }

  if (type === "clients") {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("updated_at", { ascending: false });

    const csv = makeCsv(data || [], [
      "name",
      "phone",
      "email",
      "last_visit_date",
      "notes",
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=cliente.csv",
      },
    });
  }

  if (type === "revenue") {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("status", "completed")
      .order("appointment_date", { ascending: false });

    const csv = makeCsv(data || [], [
      "client_name",
      "appointment_date",
      "appointment_time",
      "total_price",
      "status",
    ]);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=venituri.csv",
      },
    });
  }

  return NextResponse.json(
    { error: "Tip export invalid." },
    { status: 400 }
  );
}
