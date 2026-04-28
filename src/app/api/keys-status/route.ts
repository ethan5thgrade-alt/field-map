export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    mapbox: !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
    google: !!process.env.GOOGLE_PLACES_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
  });
}
