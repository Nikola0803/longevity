import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge } from "@/components/ui";
import { saveConnection, disconnectAccount } from "../connections-actions";

const PLATFORMS = [
  { key: "instagram", label: "Instagram", icon: "ri-instagram-line", placeholder: "@vertalispeptides" },
  { key: "facebook", label: "Facebook", icon: "ri-facebook-circle-line", placeholder: "facebook.com/vertalispeptides" },
  { key: "x", label: "X (Twitter)", icon: "ri-twitter-x-line", placeholder: "@vertalispeptides" },
  { key: "tiktok", label: "TikTok", icon: "ri-tiktok-line", placeholder: "@vertalispeptides" },
];

export default async function SocialAnalyticsPage() {
  const { organization } = await requireOrg();

  const accounts = await prisma.connectedAccount.findMany({
    where: { organizationId: organization.id, platform: { in: PLATFORMS.map((p) => p.key) } },
  });
  const byPlatform = Object.fromEntries(accounts.map((a) => [a.platform, a]));

  return (
    <div>
      <PageHeader title="Social Analytics" subtitle="Connect your accounts, then pull performance into one view" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {PLATFORMS.map((p) => {
          const acc = byPlatform[p.key];
          const connected = acc?.status === "CONNECTED";
          return (
            <Card key={p.key} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <i className={`${p.icon} text-lg text-cc-foreground-700`} />
                  <span className="text-sm font-medium text-cc-foreground-950">{p.label}</span>
                </div>
                <Badge status={connected ? "connected" : "pending"} />
              </div>
              {connected ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-mono text-cc-foreground-700">{acc.handle}</span>
                  <form action={disconnectAccount}>
                    <input type="hidden" name="platform" value={p.key} />
                    <input type="hidden" name="revalidateTo" value="/admin/social-analytics" />
                    <button className="text-xs text-cc-foreground-500 hover:text-cc-accent-700 underline">Disconnect</button>
                  </form>
                </div>
              ) : (
                <form action={saveConnection} className="flex items-center gap-2">
                  <input type="hidden" name="platform" value={p.key} />
                  <input type="hidden" name="revalidateTo" value="/admin/social-analytics" />
                  <input
                    name="handle"
                    required
                    placeholder={p.placeholder}
                    className="flex-1 rounded-md border border-cc-background-300 bg-cc-background-50 px-2.5 py-1.5 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
                  />
                  <button className="text-xs bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600 whitespace-nowrap">
                    Connect
                  </button>
                </form>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="p-4">
        <h2 className="text-sm font-semibold text-cc-foreground-950 mb-2">Live reach/engagement numbers</h2>
        <p className="text-sm text-cc-foreground-600 leading-relaxed">
          Saving a handle above registers the account here, but pulling real follower/engagement numbers requires an
          OAuth app approved by each platform (Meta Graph API for Instagram/Facebook, TikTok for Business API, X API) —
          that's a developer app you'd create on their side, not something togglable from here. Once you have API
          access for any of these, send me the credentials and I'll wire the live metrics pull straight into these
          cards, correlated against order spikes from the Dashboard.
        </p>
      </Card>
    </div>
  );
}
