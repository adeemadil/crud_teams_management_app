import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";

export async function GET() {
  await connectToDatabase();
  const teams = await Team.find({}).sort({ order: 1 }).lean();
  return NextResponse.json(teams);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();

  const max = await Team.findOne({}, { order: 1 }).sort({ order: -1 }).lean();
  const nextOrder = max ? (max.order ?? 0) + 1 : 0;

  const team = await Team.create({
    teamName: body.teamName,
    teamDescription: body.teamDescription,
    members: body.members ?? [],
    order: nextOrder,
  });
  return NextResponse.json(team, { status: 201 });
}

// Bulk delete
export async function DELETE(req: NextRequest) {
  await connectToDatabase();
  const body = await req.json();
  const ids: string[] = body?.ids || [];
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }
  await Team.deleteMany({ _id: { $in: ids } });
  return NextResponse.json({ success: true });
}


