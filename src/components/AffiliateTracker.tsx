"use client";

import { useEffect } from "react";
import { captureReferral } from "@/lib/affiliate";

/**
 * Mounted once in the root layout. Silently captures ?ref=CODE from the URL
 * into a 30-day cookie and pings the affiliate plugin's click-tracking
 * endpoint (see lib/affiliate.ts). Renders nothing.
 */
export default function AffiliateTracker() {
  useEffect(() => {
    captureReferral();
  }, []);

  return null;
}
