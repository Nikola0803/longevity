import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, StatCard } from "@/components/ui";
import { money } from "@/lib/format";
import { DEFAULT_SHIPPING_RATES } from "@/lib/shipping";
import { saveShippingConfig } from "./actions";

export default async function ShippingPage() {
  const { organization } = await requireOrg();

  const brand = await prisma.brand.findFirst({ where: { organizationId: organization.id } });
  const config = brand ? await prisma.shippingConfig.findUnique({ where: { brandId: brand.id } }) : null;
  const rates = config ?? DEFAULT_SHIPPING_RATES;

  const orders = await prisma.order.findMany({
    where: { organizationId: organization.id },
    select: { shippingMethod: true, shippingCents: true },
  });
  const byMethod = { standard: 0, expedited: 0, overnight: 0, international: 0 } as Record<string, number>;
  let collectedCents = 0;
  for (const o of orders) {
    if (o.shippingMethod && byMethod[o.shippingMethod] !== undefined) byMethod[o.shippingMethod]++;
    collectedCents += o.shippingCents;
  }

  return (
    <div>
      <PageHeader title="Shipping" subtitle="Rates the storefront charges at checkout — editable live, no redeploy needed" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Standard orders" value={String(byMethod.standard)} hint="Free above the threshold below" />
        <StatCard label="Expedited orders" value={String(byMethod.expedited)} hint="FedEx 2-Day" />
        <StatCard label="Overnight orders" value={String(byMethod.overnight)} hint="FedEx, US only" />
        <StatCard label="International orders" value={String(byMethod.international)} hint="DHL, flat rate" />
      </div>

      <Card className="p-4 mb-6">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-1">Rates</h2>
        <p className="text-xs text-cc-foreground-500 mb-4">
          Standard is free once the cart subtotal hits the free-shipping threshold; below it, the standard rate applies.
        </p>
        <form action={saveShippingConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">Free standard shipping above ($)</label>
            <input
              name="freeThreshold"
              type="number"
              step="0.01"
              defaultValue={(rates.freeThresholdCents / 100).toFixed(2)}
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">Standard rate below that ($)</label>
            <input
              name="standard"
              type="number"
              step="0.01"
              defaultValue={(rates.standardCents / 100).toFixed(2)}
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">Expedited — FedEx 2-Day ($)</label>
            <input
              name="expedited"
              type="number"
              step="0.01"
              defaultValue={(rates.expeditedCents / 100).toFixed(2)}
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">Overnight — FedEx, &lt;24h, US only ($)</label>
            <input
              name="overnight"
              type="number"
              step="0.01"
              defaultValue={(rates.overnightCents / 100).toFixed(2)}
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">International — DHL, flat rate, non-US ($)</label>
            <input
              name="international"
              type="number"
              step="0.01"
              defaultValue={(rates.internationalCents / 100).toFixed(2)}
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-4 py-2 font-medium hover:bg-cc-primary-600">
              Save rates
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-2">Collected so far</h2>
        <p className="text-2xl font-semibold text-cc-foreground-950 tabular-nums">{money(collectedCents)}</p>
        <p className="text-xs text-cc-foreground-500 mt-1">Total shipping revenue across all orders, all-time.</p>
      </Card>
    </div>
  );
}
