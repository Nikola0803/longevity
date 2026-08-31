import { NextResponse } from "next/server";

/**
 * Referral-click tracking (src/lib/affiliate.ts's captureReferral() posts
 * here). No CRM database anymore — this is a no-op placeholder so the
 * client-side fetch doesn't error. Wire this to your affiliate platform of
 * choice (WooCommerce affiliate plugin webhook, etc.) if you need real
 * click tracking.
 */
export async function POST() {
  return NextResponse.json({ ok: true });
}
