import { requireOrg } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { saveConnection, disconnectAccount } from "../connections-actions";

export default async function RedditMarketingPage() {
  const { organization } = await requireOrg();

  const account = await prisma.connectedAccount.findFirst({
    where: { organizationId: organization.id, platform: "reddit" },
  });
  const connected = account?.status === "CONNECTED";

  return (
    <div>
      <PageHeader title="Reddit Marketing" subtitle="Track mentions and organic community activity" />

      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <i className="ri-reddit-line text-lg text-cc-foreground-700" />
            <span className="text-sm font-medium text-cc-foreground-950">Reddit account</span>
          </div>
          <Badge status={connected ? "connected" : "pending"} />
        </div>
        {connected ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-mono text-cc-foreground-700">u/{account.handle}</span>
            <form action={disconnectAccount}>
              <input type="hidden" name="platform" value="reddit" />
              <input type="hidden" name="revalidateTo" value="/admin/reddit-marketing" />
              <button className="text-xs text-cc-foreground-500 hover:text-cc-accent-700 underline">Disconnect</button>
            </form>
          </div>
        ) : (
          <form action={saveConnection} className="flex items-center gap-2">
            <input type="hidden" name="platform" value="reddit" />
            <input type="hidden" name="revalidateTo" value="/admin/reddit-marketing" />
            <input
              name="handle"
              required
              placeholder="username (without u/)"
              className="flex-1 rounded-md border border-cc-background-300 bg-cc-background-50 px-2.5 py-1.5 text-sm text-cc-foreground-950 focus:outline-none focus:ring-2 focus:ring-cc-primary-500"
            />
            <button className="text-xs bg-cc-primary-500 text-cc-background-50 rounded-md px-3 py-1.5 font-medium hover:bg-cc-primary-600 whitespace-nowrap">
              Connect
            </button>
          </form>
        )}
      </Card>

      <EmptyState
        icon="ri-search-eye-line"
        title="Mention monitoring not wired up yet"
        body="Watching subreddits for brand/product mentions needs a Reddit API app (script-type OAuth app, free to create at reddit.com/prefs/apps). Once you have a client ID/secret, send them over and I'll build the monitor to surface mentions here — never posting on your behalf automatically."
      />
    </div>
  );
}
