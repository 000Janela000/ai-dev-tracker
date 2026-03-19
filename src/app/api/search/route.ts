import { NextRequest, NextResponse } from "next/server";
import { searchItems } from "@/lib/db/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  try {
    const items = await searchItems(q.trim(), 50);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json(
      { error: "Search unavailable" },
      { status: 503 }
    );
  }
}
