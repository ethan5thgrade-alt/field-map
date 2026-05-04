import { NextRequest } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { getOptionalUser, isOverLimit } from "@/lib/auth";
import { getOrCreateUsage, incrementUsageField } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

const RATE_LIMIT = 30;
const RATE_WINDOW = 60_000;

interface PlaceResult {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  primaryTypeDisplayName?: { text: string };
  primaryType?: string;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  location?: { latitude: number; longitude: number };
  googleMapsUri?: string;
}

function categorize(primaryType: string | undefined): string {
  if (!primaryType) return "business";
  const t = primaryType.toLowerCase();
  if (t.includes("restaurant") || t.includes("cafe") || t.includes("bakery") || t.includes("bar") || t.includes("food"))
    return "restaurant";
  if (t.includes("contractor") || t.includes("plumber") || t.includes("electrician") || t.includes("roofing") || t.includes("hvac"))
    return "contractor";
  if (t.includes("salon") || t.includes("beauty") || t.includes("barber") || t.includes("spa") || t.includes("hair"))
    return "salon";
  if (t.includes("auto") || t.includes("car") || t.includes("mechanic") || t.includes("tire"))
    return "auto";
  if (t.includes("store") || t.includes("shop") || t.includes("retail") || t.includes("boutique"))
    return "retail";
  if (t.includes("lawyer") || t.includes("accountant") || t.includes("insurance") || t.includes("real_estate") || t.includes("financial"))
    return "professional";
  return "business";
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`places:${ip}`, RATE_LIMIT, RATE_WINDOW);
  if (!ok) {
    return Response.json(
      { error: "Too many requests. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  // Server-side usage enforcement
  const user = await getOptionalUser();
  if (user) {
    const currentUsage = await getOrCreateUsage(user.id);
    if (isOverLimit(currentUsage, user.tier, "searches")) {
      return Response.json(
        { error: "Search limit reached. Upgrade your plan for more." },
        { status: 403 }
      );
    }
    await incrementUsageField(user.id, "searches");
  }

  try {
    const body = await request.json();
    const { lat, lng, radiusMiles, category } = body;

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Google Places API key not configured." },
        { status: 500 }
      );
    }

    const radiusMeters = Math.round(radiusMiles * 1609.34);
    const fieldMask =
      "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.primaryType,places.nationalPhoneNumber,places.websiteUri,places.location,places.googleMapsUri";

    const queries: string[] = [];
    if (category && category !== "all") {
      queries.push(`${category} near ${lat},${lng}`);
    } else {
      queries.push(`businesses near ${lat},${lng}`);
      queries.push(`restaurants near ${lat},${lng}`);
      queries.push(`services near ${lat},${lng}`);
    }

    const allPlaces: PlaceResult[] = [];
    const seenIds = new Set<string>();

    for (const textQuery of queries) {
      try {
        const searchRes = await fetch(
          "https://places.googleapis.com/v1/places:searchText",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Goog-Api-Key": apiKey,
              "X-Goog-FieldMask": fieldMask,
            },
            body: JSON.stringify({
              textQuery,
              locationBias: {
                circle: {
                  center: { latitude: lat, longitude: lng },
                  radius: radiusMeters,
                },
              },
              maxResultCount: 20,
            }),
          }
        );

        if (searchRes.ok) {
          const data = await searchRes.json();
          for (const place of (data.places || []) as PlaceResult[]) {
            const id = place.id || "";
            if (!seenIds.has(id)) {
              seenIds.add(id);
              allPlaces.push(place);
            }
          }
        } else {
          const errText = await searchRes.text();
          console.error("Places API error for query:", textQuery, searchRes.status, errText);
        }
      } catch (err) {
        console.error("Places search failed for query:", textQuery, err);
      }
    }

    const PARKED_PATTERNS = [
      "godaddy", "sedo", "hugedomains", "dan.com", "afternic",
      "domain is for sale", "buy this domain", "parked free",
      "this domain", "coming soon", "under construction",
      "parking page", "domainlapse",
    ];

    const businesses = await Promise.all(
      allPlaces.map(async (place) => {
        const name = place.displayName?.text || "Unknown Business";
        const placeLat = place.location?.latitude || lat;
        const placeLng = place.location?.longitude || lng;
        const dist = haversineDistance(lat, lng, placeLat, placeLng);

        let websiteStatus: "working" | "broken" | "none" = "none";
        let websiteUrl: string | null = place.websiteUri || null;

        if (websiteUrl) {
          try {
            const headController = new AbortController();
            const headTimeout = setTimeout(() => headController.abort(), 3000);
            const headRes = await fetch(websiteUrl, {
              method: "HEAD",
              redirect: "follow",
              signal: headController.signal,
              headers: { "User-Agent": "Mozilla/5.0 (compatible; Sitelab/1.0; website-check)" },
            });
            clearTimeout(headTimeout);

            if (!headRes.ok) {
              websiteStatus = "broken";
            } else {
              const getController = new AbortController();
              const getTimeout = setTimeout(() => getController.abort(), 4000);
              try {
                const getRes = await fetch(websiteUrl, {
                  method: "GET",
                  redirect: "follow",
                  signal: getController.signal,
                  headers: { "User-Agent": "Mozilla/5.0 (compatible; Sitelab/1.0; website-check)" },
                });
                clearTimeout(getTimeout);

                if (getRes.ok) {
                  const body = await getRes.text().catch(() => "");
                  const lower = body.toLowerCase();
                  const isParked = PARKED_PATTERNS.some((p) => lower.includes(p));
                  if (isParked) {
                    websiteStatus = "broken";
                  } else if (body.length < 200) {
                    websiteStatus = "broken";
                  } else {
                    websiteStatus = "working";
                  }
                } else {
                  websiteStatus = "broken";
                }
              } catch {
                websiteStatus = "working";
              }
            }
          } catch {
            websiteStatus = "broken";
          }
        }

        return {
          id: place.id || `place-${Date.now()}-${Math.random()}`,
          name,
          category: place.primaryTypeDisplayName?.text || categorize(place.primaryType),
          rating: place.rating || 0,
          reviewCount: place.userRatingCount || 0,
          address: place.formattedAddress || "",
          phone: place.nationalPhoneNumber || null,
          websiteStatus,
          websiteUrl,
          yelpUrl: `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}&find_loc=${encodeURIComponent(`${lat},${lng}`)}`,
          instagramUrl: `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}`,
          lat: placeLat,
          lng: placeLng,
          distanceMiles: Math.round(dist * 10) / 10,
          googleMapsUrl: place.googleMapsUri || null,
        };
      })
    );

    const seen = new Set<string>();
    const deduped = businesses
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .filter((biz) => {
        const key = biz.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

    return Response.json({ businesses: deduped });
  } catch (err) {
    console.error("Places route error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
