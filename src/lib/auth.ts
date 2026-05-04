import { auth, currentUser } from "@clerk/nextjs/server";
import { getOrCreateUser, getUserByClerkId } from "./db/queries";
import { TIERS } from "./store";

export async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const user = await getOrCreateUser(
    userId,
    clerkUser.emailAddresses[0]?.emailAddress || "",
    clerkUser.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
      : null
  );

  return user;
}

export async function getOptionalUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return getUserByClerkId(userId);
}

export function getTierLimits(tier: string) {
  return TIERS[tier]?.limits || TIERS.free.limits;
}

export function isOverLimit(
  currentUsage: { searches: number; pitches: number; starred: number },
  tier: string,
  field: "searches" | "pitches" | "starred"
): boolean {
  const limits = getTierLimits(tier);
  if (limits[field] === -1) return false;
  return currentUsage[field] >= limits[field];
}
