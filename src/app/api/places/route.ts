import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

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

// Map Google place types to our categories
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

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
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
  try {
    const body = await request.json();
    const { lat, lng, radiusMiles, category } = body;

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Google Places API key not configured. Add GOOGLE_PLACES_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    // Build the text query based on category or generic "businesses"
    const textQuery = category && category !== "all"
      ? `${category} near ${lat},${lng}`
      : `businesses near ${lat},${lng}`;

    const radiusMeters = Math.round(radiusMiles * 1609.34);

    // Google Places API (New) — Text Search
    const searchRes = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.primaryType,places.nationalPhoneNumber,places.websiteUri,places.location,places.googleMapsUri",
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

    if (!searchRes.ok) {
      const errText = await searchRes.text();
      console.error("Places API error:", searchRes.status, errText);
      return Response.json(
        { error: `Google Places API error: ${searchRes.status}` },
        { status: searchRes.status }
      );
    }

    const data = await searchRes.json();
    const places: PlaceResult[] = data.places || [];

    // Check website status for each place (parallel, 5s timeout)
    const businesses = await Promise.all(
      places.map(async (place) => {
        const name = place.displayName?.text || "Unknown Business";
        const placeLat = place.location?.latitude || lat;
        const placeLng = place.location?.longitude || lng;
        const dist = haversineDistance(lat, lng, placeLat, placeLng);

        let websiteStatus: "working" | "broken" | "none" = "none";
        let websiteUrl: string | null = place.websiteUri || null;

        if (websiteUrl) {
          try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);
            const res = await fetch(websiteUrl, {
              method: "HEAD",
              redirect: "follow",
              signal: controller.signal,
            });
            clearTimeout(timeout);

            if (res.ok) {
              // Check for parked domains
              const contentType = res.headers.get("content-type") || "";
              if (contentType.includes("text/html")) {
                // Could check body for parked patterns, but HEAD is enough for now
                websiteStatus = "working";
              } else {
                websiteStatus = "working";
              }
            } else {
              websiteStatus = "broken";
            }
          } catch {
            websiteStatus = "broken";
          }
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

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

    // Sort by distance, deduplicate by name
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
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
