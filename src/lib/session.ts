import { cache } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Every dashboard page calls this first, AND the admin layout calls it too
// (for the sidebar). Without request-level memoization that's two round
// trips to the DB (getServerSession + organization lookup) on every single
// navigation — layout and page each paying the cost separately. `cache()`
// dedupes it to one fetch per request, which is the single biggest local
// speedup available here short of upgrading the Neon compute tier.
export const requireOrg = cache(async function requireOrg() {
  const session = await getServerSession(authOptions);
  const organizationId = (session?.user as any)?.organizationId as string | undefined;

  if (!session || !organizationId) {
    redirect("/admin/login");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
  });

  if (!organization) {
    redirect("/admin/login");
  }

  return { session, organization: organization! };
});
