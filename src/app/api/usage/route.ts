import { requireUser, getTierLimits } from "@/lib/auth";
import { getOrCreateUsage } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    const currentUsage = await getOrCreateUsage(user.id);
    const limits = getTierLimits(user.tier);

    return Response.json({
      searches: currentUsage.searches,
      pitches: currentUsage.pitches,
      starred: currentUsage.starred,
      tier: user.tier,
      limits,
    });
  } catch {
    return Response.json(
      { searches: 0, pitches: 0, starred: 0, tier: "free", limits: getTierLimits("free") },
      { status: 200 }
    );
  }
}
