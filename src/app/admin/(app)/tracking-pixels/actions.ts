"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function saveTrackingConfig(formData: FormData) {
  const { organization } = await requireOrg();

  const brand = await prisma.brand.findFirst({ where: { organizationId: organization.id } });
  if (!brand) return;

  const clean = (v: FormDataEntryValue | null) => {
    const s = String(v ?? "").trim();
    return s.length ? s : null;
  };

  await prisma.trackingConfig.upsert({
    where: { brandId: brand.id },
    update: {
      metaPixelId: clean(formData.get("metaPixelId")),
      tiktokPixelId: clean(formData.get("tiktokPixelId")),
      ga4MeasurementId: clean(formData.get("ga4MeasurementId")),
      googleAdsId: clean(formData.get("googleAdsId")),
      customHeadScript: clean(formData.get("customHeadScript")),
    },
    create: {
      brandId: brand.id,
      metaPixelId: clean(formData.get("metaPixelId")),
      tiktokPixelId: clean(formData.get("tiktokPixelId")),
      ga4MeasurementId: clean(formData.get("ga4MeasurementId")),
      googleAdsId: clean(formData.get("googleAdsId")),
      customHeadScript: clean(formData.get("customHeadScript")),
    },
  });

  revalidatePath("/admin/tracking-pixels");
}
