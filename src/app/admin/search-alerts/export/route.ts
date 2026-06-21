import { NextRequest, NextResponse } from "next/server";

import { getCurrentSuperAdminState } from "@/lib/auth/super-admin";
import { hasPublicSupabaseEnv } from "@/lib/env.client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const state = await getCurrentSuperAdminState();

  if (!state.isAuthenticated) {
    return NextResponse.redirect(
      new URL(`/login?next=${encodeURIComponent("/admin/search-alerts/export")}`, request.url),
    );
  }

  if (!state.isSuperAdmin) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (!hasPublicSupabaseEnv()) {
    return csvResponse([]);
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("search_alerts")
    .select("id,query,email,is_active,created_at,profiles(email)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    return new NextResponse("Failed to export search alerts", { status: 500 });
  }

  const rows = (data ?? []).map((row) => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;

    return [
      row.id,
      row.query,
      row.email ?? profile?.email ?? "",
      row.is_active ? "active" : "inactive",
      row.created_at,
    ];
  });

  return csvResponse(rows);
}

function csvResponse(rows: string[][]) {
  const header = ["id", "query", "email", "status", "created_at"];
  const csv = [header, ...rows].map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="itna-search-alerts.csv"',
    },
  });
}

function escapeCsvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}
