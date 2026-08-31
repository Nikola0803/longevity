import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card } from "@/components/ui";
import { saveTrackingConfig } from "./actions";

export default async function TrackingPixelsPage() {
  const { organization } = await requireOrg();

  const brand = await prisma.brand.findFirst({ where: { organizationId: organization.id } });
  const config = brand ? await prisma.trackingConfig.findUnique({ where: { brandId: brand.id } }) : null;

  const fields: { name: string; label: string; placeholder: string; value: string }[] = [
    { name: "metaPixelId", label: "Meta (Facebook/Instagram) Pixel ID", placeholder: "e.g. 123456789012345", value: config?.metaPixelId ?? "" },
    { name: "tiktokPixelId", label: "TikTok Pixel ID", placeholder: "e.g. C4A1B2C3D4E5F6G7H8I9", value: config?.tiktokPixelId ?? "" },
    { name: "ga4MeasurementId", label: "Google Analytics 4 Measurement ID", placeholder: "e.g. G-XXXXXXXXXX", value: config?.ga4MeasurementId ?? "" },
    { name: "googleAdsId", label: "Google Ads Conversion ID", placeholder: "e.g. AW-XXXXXXXXX", value: config?.googleAdsId ?? "" },
  ];

  return (
    <div>
      <PageHeader
        title="Tracking & Pixels"
        subtitle="Paste an ID below and it goes live on the storefront immediately — no code changes, no redeploy"
      />

      <Card className="p-4 mb-6">
        <form action={saveTrackingConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name}>
              <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">{f.label}</label>
              <input
                name={f.name}
                defaultValue={f.value}
                placeholder={f.placeholder}
                className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 font-mono focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
              />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-cc-foreground-600 mb-1.5">
              Custom head script <span className="font-normal text-cc-foreground-400">(any other pixel/tag not covered above — raw JS, injected as-is)</span>
            </label>
            <textarea
              name="customHeadScript"
              defaultValue={config?.customHeadScript ?? ""}
              rows={4}
              placeholder="<!-- or plain JS, no <script> tags needed -->"
              className="w-full rounded-md border border-cc-background-300 bg-cc-background-50 px-3 py-2 text-sm text-cc-foreground-950 font-mono focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
          </div>
          <div className="sm:col-span-2">
            <button className="text-sm bg-cc-primary-500 text-cc-background-50 rounded-md px-4 py-2 font-medium hover:bg-cc-primary-600">
              Save & activate
            </button>
          </div>
        </form>
      </Card>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-2">What's live right now</h2>
        <ul className="text-sm text-cc-foreground-700 space-y-1.5">
          <li className="flex items-center gap-2">
            <i className={`ri-${config?.metaPixelId ? "checkbox-circle-fill text-cc-primary-500" : "close-circle-line text-cc-foreground-400"}`} />
            Meta Pixel — page views + purchases fire automatically once set above
          </li>
          <li className="flex items-center gap-2">
            <i className={`ri-${config?.tiktokPixelId ? "checkbox-circle-fill text-cc-primary-500" : "close-circle-line text-cc-foreground-400"}`} />
            TikTok Pixel
          </li>
          <li className="flex items-center gap-2">
            <i className={`ri-${config?.ga4MeasurementId ? "checkbox-circle-fill text-cc-primary-500" : "close-circle-line text-cc-foreground-400"}`} />
            Google Analytics 4
          </li>
          <li className="flex items-center gap-2">
            <i className={`ri-${config?.googleAdsId ? "checkbox-circle-fill text-cc-primary-500" : "close-circle-line text-cc-foreground-400"}`} />
            Google Ads conversion tag
          </li>
        </ul>
        <p className="text-xs text-cc-foreground-500 mt-3">
          Server-side conversion relay (so iOS ad-blocking doesn't undercount purchases) needs each platform's Conversions API
          token, not just a pixel ID — that's a further step once you have API access from Meta/TikTok's business tools, and
          I can wire it into the checkout flow directly when you have those tokens.
        </p>
      </Card>
    </div>
  );
}
