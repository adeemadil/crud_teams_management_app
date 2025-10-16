import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Team } from "@/models/Team";

export async function PATCH(req: NextRequest, ctx: any) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const approvalType = body?.approvalType as "manager" | "director" | undefined;
    const status = body?.status as "pending" | "approved" | "rejected" | undefined;

    if (!approvalType || !status) {
      return NextResponse.json({ error: "approvalType and status are required" }, { status: 400 });
    }

    const field = approvalType === "manager" ? "managerApproval" : "directorApproval";

    // In Next.js 15, params may be a promise and must be awaited
    const resolvedParams = 'then' in (ctx?.params ?? {}) ? await ctx.params : ctx.params;
    const id = resolvedParams?.id;

    if (!id) {
      return NextResponse.json({ error: "Missing id in route params" }, { status: 400 });
    }

    const updated = await Team.findByIdAndUpdate(
      id,
      { [field]: status },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating approval:", error?.message || error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


