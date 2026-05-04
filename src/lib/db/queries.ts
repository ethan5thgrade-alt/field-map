import { db } from "./index";
import { users, usage, starredBusinesses, pitches } from "./schema";
import { eq, and } from "drizzle-orm";

// ── User Management ──

export async function getOrCreateUser(clerkId: string, email: string, name?: string | null) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [newUser] = await db
    .insert(users)
    .values({ clerkId, email, name: name || null })
    .returning();

  return newUser;
}

export async function getUserByClerkId(clerkId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return user || null;
}

export async function updateUserTier(
  clerkId: string,
  tier: string,
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  await db
    .update(users)
    .set({
      tier,
      ...(stripeCustomerId && { stripeCustomerId }),
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
      updatedAt: new Date(),
    })
    .where(eq(users.clerkId, clerkId));
}

export async function updateUserByStripeCustomerId(
  stripeCustomerId: string,
  tier: string,
  stripeSubscriptionId?: string
) {
  await db
    .update(users)
    .set({
      tier,
      ...(stripeSubscriptionId && { stripeSubscriptionId }),
      updatedAt: new Date(),
    })
    .where(eq(users.stripeCustomerId, stripeCustomerId));
}

export async function getUserByStripeCustomerId(stripeCustomerId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, stripeCustomerId))
    .limit(1);
  return user || null;
}

export async function updateSellerProfile(
  userId: number,
  sellerName: string,
  sellerCompany: string,
  sellerSelling: string
) {
  await db
    .update(users)
    .set({ sellerName, sellerCompany, sellerSelling, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

// ── Usage Tracking ──

function currentPeriod() {
  return new Date().toISOString().slice(0, 7); // YYYY-MM
}

export async function getOrCreateUsage(userId: number) {
  const period = currentPeriod();
  const existing = await db
    .select()
    .from(usage)
    .where(and(eq(usage.userId, userId), eq(usage.period, period)))
    .limit(1);

  if (existing.length > 0) return existing[0];

  const [newUsage] = await db
    .insert(usage)
    .values({ userId, period, searches: 0, pitches: 0, starred: 0 })
    .returning();

  return newUsage;
}

export async function incrementUsageField(
  userId: number,
  field: "searches" | "pitches" | "starred"
) {
  const current = await getOrCreateUsage(userId);
  await db
    .update(usage)
    .set({ [field]: current[field] + 1 })
    .where(eq(usage.id, current.id));
  return { ...current, [field]: current[field] + 1 };
}

export async function decrementUsageField(
  userId: number,
  field: "searches" | "pitches" | "starred"
) {
  const current = await getOrCreateUsage(userId);
  const newVal = Math.max(0, current[field] - 1);
  await db
    .update(usage)
    .set({ [field]: newVal })
    .where(eq(usage.id, current.id));
  return { ...current, [field]: newVal };
}

// ── Starred Businesses ──

export async function getStarredBusinesses(userId: number) {
  return db
    .select()
    .from(starredBusinesses)
    .where(eq(starredBusinesses.userId, userId))
    .orderBy(starredBusinesses.createdAt);
}

export async function addStarredBusiness(
  userId: number,
  businessId: string,
  data: unknown
) {
  const [result] = await db
    .insert(starredBusinesses)
    .values({ userId, businessId, data })
    .returning();
  return result;
}

export async function removeStarredBusiness(userId: number, businessId: string) {
  await db
    .delete(starredBusinesses)
    .where(
      and(
        eq(starredBusinesses.userId, userId),
        eq(starredBusinesses.businessId, businessId)
      )
    );
}

export async function clearStarredBusinesses(userId: number) {
  await db
    .delete(starredBusinesses)
    .where(eq(starredBusinesses.userId, userId));
}

// ── Pitches ──

export async function savePitchRecord(
  userId: number,
  businessName: string,
  businessCategory: string,
  type: string,
  preview: string
) {
  const [result] = await db
    .insert(pitches)
    .values({ userId, businessName, businessCategory, type, preview })
    .returning();
  return result;
}

export async function getPitches(userId: number) {
  return db
    .select()
    .from(pitches)
    .where(eq(pitches.userId, userId))
    .orderBy(pitches.createdAt);
}

export async function clearPitches(userId: number) {
  await db.delete(pitches).where(eq(pitches.userId, userId));
}
