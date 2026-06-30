/**
 * AI extraction service.
 *
 * `AiExtractor` is the seam between the product and the model. Today it is a
 * deterministic rule-based `MockExtractor` (instant, free, demo-safe); tomorrow
 * swap in `OpenAiExtractor` (sketched at the bottom) — the rest of the app never
 * changes because it only depends on this interface and the `Extraction` shape.
 */
import type { Extraction, Property } from "@/lib/domain";
import { departmentForCategory, type Intent, type Priority, type TaskCategory } from "@/lib/domain";

export interface ExtractionInput {
  /** the raw guest message */
  body: string;
  /** the property resolved from the sender (their WhatsApp number), if known */
  property: Property | null;
  /** all properties, for name-matching when the sender isn't pre-mapped */
  properties: Property[];
}

export interface AiExtractor {
  extract(input: ExtractionInput): Promise<Extraction>;
}

/* ----------------------------- keyword model ---------------------------- */

const CATEGORY_RULES: { category: TaskCategory; words: RegExp }[] = [
  { category: "maintenance", words: /\b(ac|a\/c|air ?con|cooling|heating|heater|broken|not working|leak|leaking|flood|drip|plumb|toilet|tap|faucet|wifi|wi-fi|internet|tv|television|light|bulb|power|electric|socket|door|lock|window|pool pump|boiler|hot water|fridge|oven)\b/i },
  { category: "housekeeping", words: /\b(clean|cleaning|towel|towels|sheets|linen|laundry|dirty|tidy|rubbish|trash|bin|amenities|toiletries|make up the|restock|refill)\b/i },
  { category: "fnb", words: /\b(chef|breakfast|lunch|dinner|meal|food|grocer|groceries|wine|champagne|drinks|bar|restaurant booking|menu|barbecue|bbq|cake)\b/i },
  { category: "transport", words: /\b(transfer|airport|taxi|car|driver|chauffeur|pick ?up|drop ?off|yacht|boat|helicopter|rental)\b/i },
  { category: "concierge", words: /\b(book|booking|reserv|reservation|spa|massage|tour|excursion|tickets|table|golf|babysit|nanny|tee time|beach club)\b/i },
  { category: "security", words: /\b(security|alarm|gate|intruder|noise|cctv|safe|emergency|police)\b/i },
];

const URGENT = /\b(not working|broken|leak|leaking|flood|no (power|water|electric|hot water|wifi|internet)|emergency|urgent|asap|right now|immediately|stuck|won'?t|cannot|can'?t|locked out)\b/i;
const HIGH = /\b(today|tonight|this evening|soon|before|by \d|arriving|guests? coming|hot|cold|uncomfortable)\b/i;

const COMPLAINT = /\b(unacceptable|terrible|awful|angry|disappointed|complain|complaint|ridiculous|worst|refund)\b/i;
const QUESTION = /\b(what|when|where|how|can you tell|is it possible|do you|could you tell|\?)\b/i;
const REQUEST = /\b(can you|could you|please|would like|we'?d like|i'?d like|need|want|arrange|organi[sz]e|book|send|bring|set up)\b/i;

/** common rooms, ordered so the most specific match wins */
const ROOM_PATTERNS: { label: string; re: RegExp }[] = [
  { label: "Master Bedroom", re: /\bmaster (bed)?room|master suite|main bedroom\b/i },
  { label: "Guest Bedroom", re: /\bguest (bed)?room|second bedroom|kids? (bed)?room\b/i },
  { label: "Bedroom", re: /\bbedroom\b/i },
  { label: "Master Bathroom", re: /\bmaster bath/i },
  { label: "Bathroom", re: /\b(bath ?room|en-?suite|shower|toilet)\b/i },
  { label: "Kitchen", re: /\bkitchen\b/i },
  { label: "Living Room", re: /\b(living|lounge|sitting) room\b/i },
  { label: "Pool", re: /\b(pool|jacuzzi|hot tub)\b/i },
  { label: "Terrace", re: /\b(terrace|patio|balcony|rooftop)\b/i },
  { label: "Garden", re: /\bgarden\b/i },
  { label: "Gym", re: /\b(gym|fitness)\b/i },
  { label: "Cinema Room", re: /\b(cinema|home theat)/i },
  { label: "Garage", re: /\bgarage\b/i },
];

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

/** deterministic, dependency-free extractor — good enough to demo, easy to swap */
export class MockExtractor implements AiExtractor {
  /** artificial latency so the UI can show "LUXA is analysing…" */
  constructor(private readonly latencyMs = 1100) {}

  async extract({ body, property, properties }: ExtractionInput): Promise<Extraction> {
    await new Promise((r) => setTimeout(r, this.latencyMs));
    const text = body.trim();

    // category
    const category: TaskCategory =
      CATEGORY_RULES.find((r) => r.words.test(text))?.category ?? "other";
    const department = departmentForCategory(category);

    // priority
    const priority: Priority = URGENT.test(text) ? "urgent" : HIGH.test(text) ? "high" : "normal";

    // intent
    const intent: Intent = COMPLAINT.test(text)
      ? "complaint"
      : category === "maintenance" && URGENT.test(text)
        ? "issue"
        : REQUEST.test(text)
          ? "request"
          : QUESTION.test(text)
            ? "question"
            : category === "maintenance"
              ? "issue"
              : "request";

    // property — sender's mapped property, else try to match a name in the text
    const matchedByName =
      property ?? properties.find((p) => new RegExp(`\\b${p.name}\\b`, "i").test(text)) ?? null;

    // room
    const room =
      matchedByName?.rooms.find((r) => new RegExp(`\\b${r}\\b`, "i").test(text)) ??
      ROOM_PATTERNS.find((r) => r.re.test(text))?.label ??
      null;

    // title — concise + action oriented
    const subject = describeSubject(text, category);
    const title = room ? `${subject} — ${room}` : subject;

    // confidence — higher when we resolved more fields
    let confidence = 0.6;
    if (category !== "other") confidence += 0.18;
    if (room) confidence += 0.12;
    if (matchedByName) confidence += 0.07;
    confidence = Math.min(0.98, Math.round(confidence * 100) / 100);

    return {
      intent,
      category,
      department,
      priority,
      propertyId: matchedByName?.id ?? null,
      propertyName: matchedByName?.name ?? null,
      room,
      title,
      summary: text.length > 120 ? `${text.slice(0, 117)}…` : text,
      confidence,
    };
  }
}

/** turn raw text into a short subject like "AC not cooling" or "Late checkout" */
function describeSubject(text: string, category: TaskCategory): string {
  const t = text.toLowerCase();
  if (/\bac|a\/c|air ?con|cooling\b/.test(t)) return "AC not working";
  if (/\bwifi|wi-fi|internet\b/.test(t)) return "WiFi issue";
  if (/\bhot water|boiler\b/.test(t)) return "No hot water";
  if (/\bleak|leaking|flood|drip\b/.test(t)) return "Water leak";
  if (/\blight|bulb\b/.test(t)) return "Lighting issue";
  if (/\btv|television\b/.test(t)) return "TV not working";
  if (/\btowel|towels\b/.test(t)) return "Fresh towels requested";
  if (/\bclean|cleaning|tidy\b/.test(t)) return "Cleaning requested";
  if (/\blate check ?out\b/.test(t)) return "Late checkout requested";
  if (/\bchef|dinner|meal\b/.test(t)) return "Private chef requested";
  if (/\btransfer|airport|taxi|driver\b/.test(t)) return "Transport requested";
  if (/\bspa|massage\b/.test(t)) return "Spa booking requested";
  if (/\btable|restaurant|reserv\b/.test(t)) return "Restaurant reservation";
  if (category === "maintenance") return "Maintenance issue";
  if (category === "housekeeping") return "Housekeeping request";
  if (category === "fnb") return "F&B request";
  if (category === "transport") return "Transport request";
  if (category === "concierge") return "Concierge request";
  // fall back to the first words of the message
  return titleCase(text.split(/[.!?]/)[0].split(" ").slice(0, 6).join(" "));
}

/**
 * Production implementation (kept as a reference — swap into `getExtractor()`):
 *
 * export class OpenAiExtractor implements AiExtractor {
 *   constructor(private client: OpenAI) {}
 *   async extract({ body, property, properties }: ExtractionInput): Promise<Extraction> {
 *     const res = await this.client.chat.completions.create({
 *       model: "gpt-4o-mini",
 *       messages: [
 *         { role: "system", content: SYSTEM_PROMPT },
 *         { role: "user", content: JSON.stringify({ body, property, properties }) },
 *       ],
 *       response_format: { type: "json_schema", json_schema: EXTRACTION_SCHEMA },
 *     });
 *     return JSON.parse(res.choices[0].message.content!) as Extraction;
 *   }
 * }
 */

/** the active extractor — one place to flip mock → real */
export const extractor: AiExtractor = new MockExtractor();
