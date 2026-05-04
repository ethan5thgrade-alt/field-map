import { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth";
import { updateSellerProfile } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireUser();
    return Response.json({
      sellerName: user.sellerName || "",
      sellerCompany: user.sellerCompany || "",
      sellerSelling: user.sellerSelling || "",
    });
  } catch {
    return Response.json({ sellerName: "", sellerCompany: "", sellerSelling: "" });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser();
    const { sellerName, sellerCompany, sellerSelling } = await request.json();
    await updateSellerProfile(user.id, sellerName || "", sellerCompany || "", sellerSelling || "");
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
