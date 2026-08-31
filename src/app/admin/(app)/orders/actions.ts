"use server";

import { revalidatePath } from "next/cache";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function setOrderStatus(formData: FormData) {
  const { organization } = await requireOrg();
  const orderId = String(formData.get("orderId"));
  const status = String(formData.get("status")) as
    | "PENDING"
    | "COMPLETED"
    | "PROCESSING"
    | "ON_HOLD"
    | "REFUNDED"
    | "CANCELLED";

  await prisma.order.updateMany({
    where: { id: orderId, organizationId: organization.id },
    data: { status },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
