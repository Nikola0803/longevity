import "server-only";

/**
 * Mailchimp newsletter subscription. Best-effort: the CRM's own Contact
 * table is always the source of truth (subscription requests save there
 * first, unconditionally), and this is only called after, so a Mailchimp
 * outage or misconfiguration never blocks a signup or an order.
 *
 * MAILCHIMP_API_KEY is a real key ("xxxxxxxx-us6" shaped, the "-usN" suffix
 * is the datacenter and determines the API host). MAILCHIMP_LIST_ID (the
 * Audience/List ID from Mailchimp's Audience > Settings page) still needs
 * to be set — subscribeToMailchimp() no-ops until it is, rather than
 * failing loudly on every signup.
 */
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

function datacenter(): string | null {
  if (!MAILCHIMP_API_KEY) return null;
  const parts = MAILCHIMP_API_KEY.split("-");
  return parts.length === 2 ? parts[1] : null;
}

export function mailchimpConfigured() {
  return Boolean(MAILCHIMP_API_KEY && MAILCHIMP_LIST_ID && datacenter());
}

/** Fire-and-forget-ish: logs failures, never throws, never blocks the caller. */
export async function subscribeToMailchimp(email: string, opts?: { firstName?: string; lastName?: string }) {
  if (!mailchimpConfigured()) return { ok: false, reason: "not_configured" as const };

  const dc = datacenter();
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members/`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${MAILCHIMP_API_KEY}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          ...(opts?.firstName ? { FNAME: opts.firstName } : {}),
          ...(opts?.lastName ? { LNAME: opts.lastName } : {}),
        },
      }),
    });

    // 400 with "Member Exists" just means they're already subscribed -- not a failure.
    if (res.ok) return { ok: true as const };
    const data = await res.json().catch(() => ({}));
    if (data?.title === "Member Exists") return { ok: true as const };

    console.error("[mailchimp] subscribe failed", res.status, data);
    return { ok: false, reason: "mailchimp_error" as const };
  } catch (err) {
    console.error("[mailchimp] subscribe request failed", err);
    return { ok: false, reason: "network_error" as const };
  }
}
