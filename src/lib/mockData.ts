export interface Business {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: string;
  phone: string | null;
  websiteStatus: "working" | "broken" | "none";
  websiteUrl: string | null;
  yelpUrl: string;
  instagramUrl: string | null;
  lat: number;
  lng: number;
  distanceMiles: number;
}

const NAMES: Record<string, string[]> = {
  restaurant: [
    "Golden Fork Bistro", "Casa del Sol", "The Hungry Rooster",
    "Jade Palace", "Nonna's Kitchen", "Riverside Grill",
    "Blue Agave Cantina", "The Rusty Skillet", "Maple & Vine",
  ],
  contractor: [
    "Summit Builders LLC", "Ironwood Construction", "Pinnacle Roofing Co",
    "Cedar Valley Plumbing", "Granite State Electric", "Trueblue Handyman",
    "Cornerstone Renovations", "Ridgeline Fencing", "Atlas Concrete",
  ],
  salon: [
    "The Polished Look", "Velvet Shears", "Luxe Hair Studio",
    "Ember & Bloom Salon", "The Cutting Edge", "Rosewood Beauty",
    "Shear Bliss", "Mane Attraction", "Studio 44 Hair",
  ],
  auto: [
    "Precision Auto Care", "Roadmaster Garage", "AllStar Tire & Brake",
    "Apex Auto Body", "Westside Motors Service", "QuickLube Express",
  ],
  retail: [
    "Hometown Hardware", "The Paper Lantern", "Second Wind Thrift",
    "Wildflower Boutique", "Main Street Mercantile", "The Good Stuff",
  ],
  professional: [
    "Clearview Accounting", "Oakmont Legal Group", "Brightpath Insurance",
    "Keystone Financial", "Heritage Realty", "Compass Tax Services",
  ],
};

const STREETS = [
  "Main St", "Oak Ave", "Elm Dr", "Commerce Blvd", "First St",
  "Maple Ln", "Industrial Pkwy", "Center Ave", "Pine St", "Market St",
  "Broadway", "Washington Ave", "Jefferson Rd", "Lincoln Blvd", "Park Ave",
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function generateMockBusinesses(
  centerLat: number,
  centerLng: number,
  radiusMiles: number,
  count: number = 15
): Business[] {
  const categories = Object.keys(NAMES);
  const businesses: Business[] = [];

  for (let i = 0; i < count; i++) {
    const category = randomFrom(categories);
    const name = randomFrom(NAMES[category]);
    const distanceMiles = randomBetween(0.2, radiusMiles);

    // Random point within radius
    const angle = Math.random() * 2 * Math.PI;
    const distKm = distanceMiles * 1.60934;
    const dLat = (distKm * Math.cos(angle)) / 111.32;
    const dLng =
      (distKm * Math.sin(angle)) /
      (111.32 * Math.cos((centerLat * Math.PI) / 180));

    const websiteRoll = Math.random();
    const websiteStatus: Business["websiteStatus"] =
      websiteRoll < 0.4 ? "none" : websiteRoll < 0.55 ? "broken" : "working";

    const hasPhone = Math.random() > 0.15;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const hasInstagram = Math.random() > 0.45;

    businesses.push({
      id: `mock-${i}-${Date.now()}`,
      name: name + (businesses.some((b) => b.name === name) ? ` #${i}` : ""),
      category,
      rating: Math.round(randomBetween(2.5, 5.0) * 10) / 10,
      reviewCount: Math.floor(randomBetween(3, 350)),
      address: `${Math.floor(randomBetween(100, 9999))} ${randomFrom(STREETS)}`,
      phone: hasPhone
        ? `(${Math.floor(randomBetween(200, 999))}) ${Math.floor(
            randomBetween(200, 999)
          )}-${Math.floor(randomBetween(1000, 9999))}`
        : null,
      websiteStatus,
      websiteUrl:
        websiteStatus === "working"
          ? `https://www.${name.toLowerCase().replace(/[^a-z]/g, "")}.com`
          : websiteStatus === "broken"
          ? `http://${name.toLowerCase().replace(/[^a-z]/g, "")}.com`
          : null,
      yelpUrl: `https://www.yelp.com/search?find_desc=${encodeURIComponent(name)}&find_loc=${encodeURIComponent(`${centerLat},${centerLng}`)}`,
      instagramUrl: hasInstagram
        ? `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(name)}`
        : null,
      lat: centerLat + dLat,
      lng: centerLng + dLng,
      distanceMiles: Math.round(distanceMiles * 10) / 10,
    });
  }

  return businesses.sort((a, b) => a.distanceMiles - b.distanceMiles);
}
