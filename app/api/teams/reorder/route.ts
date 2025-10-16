import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const items: { id: string; order: number }[] = await req.json();
  if (!Array.isArray(items)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await Promise.all(
    items.map((it) => Team.findByIdAndUpdate(it.id, { order: it.order }))
  );
  return NextResponse.json({ success: true });
}


