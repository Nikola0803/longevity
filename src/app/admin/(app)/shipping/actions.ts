"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function dollarsToCents(v: FormDataEntryValue | null): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n * 100) : 0;
}

export async function saveShippingConfig(formData: FormData) {
  const { organization } = await requireOrg();
  const brand = await prisma.brand.findFirst({ where: { organizationId: organization.id } });
  if (!brand) return;

  const data = {
    freeThresholdCents: dollarsToCents(formData.get("freeThreshold")),
    standardCents: dollarsToCents(formData.get("standard")),
    expeditedCents: dollarsToCents(formData.get("expedited")),
    overnightCents: dollarsToCents(formData.get("overnight")),
    internationalCents: dollarsToCents(formData.get("international")),
  };

  await prisma.shippingConfig.upsert({
    where: { brandId: brand.id },
    update: data,
    create: { brandId: brand.id, ...data },
  });

  revalidatePath("/admin/shipping");
}
