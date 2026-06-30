import "server-only";

/**
 * Outbound WhatsApp via the Cloud API. No-op (returns false) when not configured
 * — we never fake a send. Returns true when the message was accepted by Meta.
 */
import { hasWhatsAppSend, serverEnv } from "@/lib/config";

export async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
  if (!hasWhatsAppSend()) return false;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${serverEnv.whatsappPhoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serverEnv.whatsappAccessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: to.replace(/^\+/, ""),
          type: "text",
          text: { body },
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}
