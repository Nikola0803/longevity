"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Adds a new first-party Brand (a second Longevity Peptides-style storefront running
// this same codebase) rather than an external WooCommerce store. Deploy
// another copy of this app with STORE_BRAND_SLUG set to the new brand's
// slug and it becomes that site's backend, sharing this same CRM/CMS and
// database — no plugin, no webhook, because it's not a separate system.
export async function createBrand(formData: FormData) {
  const { organization } = await requireOrg();
  const name = String(formData.get("name") ?? "").trim();
  const domain = String(formData.get("domain") ?? "").trim();
  if (!name || !domain) return;

  const slug = slugify(name);

  await prisma.brand.create({
    data: {
      organizationId: organization.id,
      name,
      domain,
      slug,
      status: "CONNECTED",
      lastSyncedAt: new Date(),
    },
  });

  revalidatePath("/admin/webhooks");
  revalidatePath("/admin/settings");
}
