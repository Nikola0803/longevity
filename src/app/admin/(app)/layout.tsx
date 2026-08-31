import { Sidebar } from "@/components/sidebar";
import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { organization } = await requireOrg();

  const brandCount = await prisma.brand.count({
    where: { organizationId: organization.id, status: "CONNECTED" },
  });

  return (
    <div className="cc-app min-h-screen flex bg-cc-background-100">
      <Sidebar organizationName={organization.name} brandCount={brandCount} />
      <main className="flex-1 min-w-0 p-6">{children}</main>
    </div>
  );
}
