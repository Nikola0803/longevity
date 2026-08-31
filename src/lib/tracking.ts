import "server-only";
import { prisma } from "@/lib/prisma";
import { getStoreContext } from "@/lib/store-context";

export async function getStorefrontTracking() {
  try {
    const { brandId } = await getStoreContext();
    return await prisma.trackingConfig.findUnique({ where: { brandId } });
  } catch {
    return null;
  }
}
