import { NextRequest } from "next/server";
import { requireUser, isOverLimit } from "@/lib/auth";
import {
  getStarredBusinesses,
  addStarredBusiness,
  removeStarredBusiness,
  clearStarredBusinesses,
  getOrCreateUsage,
  incrementUsageField,
  decrementUsageField,
} from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const starred = await getStarredBusinesses(user.id);
    return Response.json({ starred: starred.map((s) => s.data) });
  } catch {
    return Response.json({ starred: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { businessId, data } = await request.json();

    const currentUsage = await getOrCreateUsage(user.id);
    if (isOverLimit(currentUsage, user.tier, "starred")) {
      return Response.json(
        { error: "Starred limit reached. Upgrade your plan." },
        { status: 403 }
      );
    }

    await addStarredBusiness(user.id, businessId, data);
    await incrementUsageField(user.id, "starred");

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: "Failed to star business" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireUser();
    const { businessId, clearAll } = await request.json();

    if (clearAll) {
      await clearStarredBusinesses(user.id);
    } else {
      await removeStarredBusiness(user.id, businessId);
      await decrementUsageField(user.id, "starred");
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to unstar" }, { status: 500 });
  }
}
