import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";

export async function GET(_req: NextRequest, ctx: any) {
  await connectToDatabase();
  const resolved = 'then' in (ctx?.params ?? {}) ? await ctx.params : ctx.params;
  const id = resolved?.id;
  const team = await Team.findById(id).lean();
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function PUT(req: NextRequest, ctx: any) {
  await connectToDatabase();
  const resolved = 'then' in (ctx?.params ?? {}) ? await ctx.params : ctx.params;
  const id = resolved?.id;
  const body = await req.json();
  const updated = await Team.findByIdAndUpdate(
    id,
    {
      teamName: body.teamName,
      teamDescription: body.teamDescription,
      members: body.members ?? [],
      managerApproval: body.managerApproval,
      directorApproval: body.directorApproval,
    },
    { new: true }
  ).lean();
  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: any) {
  await connectToDatabase();
  const resolved = 'then' in (ctx?.params ?? {}) ? await ctx.params : ctx.params;
  const id = resolved?.id;
  await Team.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}


