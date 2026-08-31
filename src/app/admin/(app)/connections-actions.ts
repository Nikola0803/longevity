"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

// Shared by Social Analytics + Reddit Marketing — both are "connect a
// handle/account" pages backed by the same ConnectedAccount table, just
// filtered to different `platform` values.
export async function saveConnection(formData: FormData) {
  const { organization } = await requireOrg();
  const platform = String(formData.get("platform"));
  const handle = String(formData.get("handle") || "").trim();
  const revalidateTo = String(formData.get("revalidateTo") || "/admin/social-analytics");

  if (!platform) return;

  await prisma.connectedAccount.upsert({
    where: { organizationId_platform: { organizationId: organization.id, platform } },
    update: { handle: handle || null, status: handle ? "CONNECTED" : "NOT_CONNECTED" },
    create: { organizationId: organization.id, platform, handle: handle || null, status: handle ? "CONNECTED" : "NOT_CONNECTED" },
  });

  revalidatePath(revalidateTo);
}

export async function disconnectAccount(formData: FormData) {
  const { organization } = await requireOrg();
  const platform = String(formData.get("platform"));
  const revalidateTo = String(formData.get("revalidateTo") || "/admin/social-analytics");

  await prisma.connectedAccount.updateMany({
    where: { organizationId: organization.id, platform },
    data: { handle: null, accessToken: null, status: "NOT_CONNECTED" },
  });

  revalidatePath(revalidateTo);
}
