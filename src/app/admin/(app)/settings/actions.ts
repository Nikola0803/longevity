"use server";

import { revalidatePath } from "next/cache";
import { createId } from "@/lib/id";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function regenerateApiKey() {
  const { organization } = await requireOrg();

  await prisma.organization.update({
    where: { id: organization.id },
    data: { apiKey: createId() },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/admin/webhooks");
}

export async function updateBrandProfile(formData: FormData) {
  const { organization } = await requireOrg();
  const brandId = String(formData.get("brandId") || "");

  const brand = await prisma.brand.findFirst({ where: { id: brandId, organizationId: organization.id } });
  if (!brand) return;

  const str = (key: string) => {
    const v = String(formData.get(key) || "").trim();
    return v ? v : null;
  };

  await prisma.brand.update({
    where: { id: brand.id },
    data: {
      logoUrl: str("logoUrl"),
      supportEmail: str("supportEmail"),
      senderName: str("senderName"),
      emailAccentColor: str("emailAccentColor"),
      businessAddress: str("businessAddress"),
    },
  });

  revalidatePath("/admin/settings");
}
