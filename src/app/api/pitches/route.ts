import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { getPitches, savePitchRecord, clearPitches } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const records = await getPitches(user.id);
    return Response.json({
      pitches: records.map((r) => ({
        id: String(r.id),
        businessName: r.businessName,
        businessCategory: r.businessCategory,
        type: r.type,
        date: r.createdAt.toISOString(),
        preview: r.preview,
      })),
    });
  } catch {
    return Response.json({ pitches: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { businessName, businessCategory, type, preview } = await request.json();
    await savePitchRecord(user.id, businessName, businessCategory || "", type, preview || "");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to save pitch" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await requireUser();
    await clearPitches(user.id);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to clear" }, { status: 500 });
  }
}
