/**
 * WhatsApp Cloud API ingestion.
 *
 * The product never reads the raw Meta webhook shape directly — it goes through
 * `parseWhatsAppWebhook`, which normalises it into `InboundMessage`. When the real
 * webhook is wired up (a Next.js route handler verifying the X-Hub signature),
 * it calls this exact function, so nothing downstream changes.
 */

export interface InboundMessage {
  /** sender's phone in E.164 (the WhatsApp identity) */
  from: string;
  /** provider message id (wamid) */
  waMessageId: string;
  body: string;
  /** unix seconds, as WhatsApp sends it */
  timestamp: number;
  profileName?: string;
}

/** the subset of the Meta webhook payload we rely on */
export interface WhatsAppWebhook {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        contacts?: Array<{ profile?: { name?: string }; wa_id?: string }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
}

/** flatten a Cloud API webhook into normalised inbound text messages */
export function parseWhatsAppWebhook(payload: WhatsAppWebhook): InboundMessage[] {
  const out: InboundMessage[] = [];
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      if (!value?.messages) continue;
      const profile = value.contacts?.[0]?.profile?.name;
      for (const m of value.messages) {
        if (m.type && m.type !== "text") continue; // demo handles text only
        if (!m.from || !m.text?.body) continue;
        out.push({
          from: normalisePhone(m.from),
          waMessageId: m.id ?? "",
          body: m.text.body,
          timestamp: Number(m.timestamp) || Math.floor(Date.now() / 1000),
          profileName: profile,
        });
      }
    }
  }
  return out;
}

/** build a realistic Cloud API webhook payload (used by the demo simulator) */
export function buildWhatsAppWebhook(args: { from: string; body: string; name?: string; waMessageId?: string }): WhatsAppWebhook {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        id: "DEMO_WABA",
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              contacts: args.name ? [{ profile: { name: args.name }, wa_id: args.from }] : undefined,
              messages: [
                {
                  from: args.from,
                  id: args.waMessageId ?? `wamid.DEMO${Math.random().toString(36).slice(2, 10)}`,
                  timestamp: String(Math.floor(Date.now() / 1000)),
                  type: "text",
                  text: { body: args.body },
                },
              ],
            },
          },
        ],
      },
    ],
  };
}

function normalisePhone(p: string): string {
  const digits = p.replace(/[^\d]/g, "");
  return digits.startsWith("+") ? digits : `+${digits}`;
}
