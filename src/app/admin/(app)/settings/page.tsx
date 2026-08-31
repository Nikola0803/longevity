import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { CopyableField } from "@/components/copyable-field";
import { regenerateApiKey, updateBrandProfile } from "./actions";
import { SignOutButton } from "@/components/sign-out-button";

export default async function SettingsPage() {
  const { organization, session } = await requireOrg();

  const [memberCount, brands] = await Promise.all([
    prisma.membership.count({ where: { organizationId: organization.id } }),
    prisma.brand.findMany({ where: { organizationId: organization.id }, orderBy: { createdAt: "asc" } }),
  ]);
  const brandCount = brands.length;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Organization, plan, and connection details" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950 mb-3">Organization</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-cc-foreground-500">Name</dt>
              <dd className="text-cc-foreground-800">{organization.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cc-foreground-500">Plan</dt>
              <dd className="text-cc-foreground-800 capitalize">{organization.plan.toLowerCase()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cc-foreground-500">Team members</dt>
              <dd className="text-cc-foreground-800">{memberCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cc-foreground-500">Brands connected</dt>
              <dd className="text-cc-foreground-800">{brandCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-cc-foreground-500">Signed in as</dt>
              <dd className="text-cc-foreground-800">{session.user?.email}</dd>
            </div>
          </dl>
          <div className="mt-4 pt-4 border-t border-cc-background-200">
            <SignOutButton />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-sm font-semibold text-cc-foreground-950 mb-1">Plugin API key</h2>
          <p className="text-xs text-cc-foreground-500 mb-3">
            Used by the WordPress plugin to register new brands. Regenerating it immediately invalidates the old
            key — sites that haven't re-entered the new one will stop being able to (re)register, but already
            connected brands keep syncing on their existing per-brand webhook secret.
          </p>
          <CopyableField label="Organization API key" value={organization.apiKey} monospace />
          <form action={regenerateApiKey} className="mt-3">
            <button className="text-sm border border-cc-background-300 rounded-md px-3 py-1.5 text-cc-foreground-800 hover:bg-cc-background-100">
              Regenerate key
            </button>
          </form>
        </Card>
      </div>

      <div className="mt-4 space-y-4">
        {brands.map((brand) => (
          <Card key={brand.id} className="p-4">
            <h2 className="text-sm font-semibold text-cc-foreground-950 mb-1">
              {brand.name} <span className="text-cc-foreground-500 font-normal">&middot; {brand.domain}</span>
            </h2>
            <p className="text-xs text-cc-foreground-500 mb-4">
              Shop profile used to style marketing emails and shown on the storefront. Mandatory before sending any
              marketing email — the business address is required for CAN-SPAM compliance.
            </p>
            <form action={updateBrandProfile} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="hidden" name="brandId" value={brand.id} />

              <label className="text-sm sm:col-span-2">
                <span className="mb-1 block text-cc-foreground-700">Logo URL</span>
                <input
                  name="logoUrl"
                  defaultValue={brand.logoUrl ?? ""}
                  placeholder="https://evlvpeptides.com/logo/evlv-logo-light.png"
                  className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-cc-foreground-700">Support email</span>
                <input
                  name="supportEmail"
                  type="email"
                  defaultValue={brand.supportEmail ?? ""}
                  placeholder="support@evlvpeptides.com"
                  className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-cc-foreground-700">Sender name (marketing emails)</span>
                <input
                  name="senderName"
                  defaultValue={brand.senderName ?? ""}
                  placeholder="EVLV Team"
                  className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-cc-foreground-700">Email accent color</span>
                <input
                  name="emailAccentColor"
                  defaultValue={brand.emailAccentColor ?? ""}
                  placeholder="#B8875A"
                  className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                />
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-cc-foreground-700">Business address</span>
                <input
                  name="businessAddress"
                  defaultValue={brand.businessAddress ?? ""}
                  placeholder="Required on marketing emails (CAN-SPAM)"
                  className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                />
              </label>

              <button className="sm:col-span-2 justify-self-start text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-4 py-2 font-medium hover:bg-cc-primary-600">
                Save shop profile
              </button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
