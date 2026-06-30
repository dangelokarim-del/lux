import "server-only";

/**
 * Production extractor backed by OpenAI structured outputs. Given a guest
 * message + the property context, it returns a strict `Extraction`. Used by the
 * server ingest pipeline whenever OPENAI_API_KEY is set.
 */
import OpenAI from "openai";
import {
  CATEGORIES,
  INTENTS,
  PRIORITIES,
  departmentForCategory,
  type Extraction,
  type Property,
  type TaskCategory,
} from "@/lib/domain";
import { serverEnv } from "@/lib/config";
import type { AiExtractor, ExtractionInput } from "./extractor";

const SYSTEM = `You are the triage engine for LUXA, a luxury villa operations platform in Marbella.
A guest has sent a message over WhatsApp. Extract a single structured task.
Rules:
- intent: one of issue, request, question, complaint, feedback.
- category: one of maintenance, housekeeping, concierge, fnb (food & beverage), transport, security, other.
- priority: urgent (broken/leak/no power-water-AC, emergencies), high (needed today/soon), normal, low.
- room: the specific room if mentioned (e.g. "Master Bedroom", "Kitchen", "Pool"), else null.
- title: a concise, action-oriented task title (max 8 words), e.g. "AC not cooling — Master Bedroom".
- summary: one short sentence describing what the guest needs.
- confidence: 0–1, how sure you are.
Only use the property name from the provided context. Be precise and conservative.`;

const SCHEMA = {
  name: "task_extraction",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      intent: { type: "string", enum: [...INTENTS] },
      category: { type: "string", enum: [...CATEGORIES] },
      priority: { type: "string", enum: [...PRIORITIES] },
      room: { type: ["string", "null"] },
      title: { type: "string" },
      summary: { type: "string" },
      confidence: { type: "number" },
    },
    required: ["intent", "category", "priority", "room", "title", "summary", "confidence"],
  },
} as const;

export class OpenAiExtractor implements AiExtractor {
  private client: OpenAI;
  constructor(private model = serverEnv.openaiModel) {
    this.client = new OpenAI({ apiKey: serverEnv.openaiApiKey });
  }

  async extract({ body, property, properties }: ExtractionInput): Promise<Extraction> {
    const context = {
      message: body,
      property: property ? { name: property.name, rooms: property.rooms } : null,
      knownProperties: properties.map((p) => p.name),
    };

    const res = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.1,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: JSON.stringify(context) },
      ],
      response_format: { type: "json_schema", json_schema: SCHEMA },
    });

    const parsed = JSON.parse(res.choices[0]?.message?.content ?? "{}") as {
      intent: Extraction["intent"];
      category: TaskCategory;
      priority: Extraction["priority"];
      room: string | null;
      title: string;
      summary: string;
      confidence: number;
    };

    const resolvedProperty = resolveProperty(property, properties);
    return {
      intent: parsed.intent,
      category: parsed.category,
      department: departmentForCategory(parsed.category),
      priority: parsed.priority,
      propertyId: resolvedProperty?.id ?? null,
      propertyName: resolvedProperty?.name ?? null,
      room: parsed.room,
      title: parsed.title,
      summary: parsed.summary,
      confidence: clamp01(parsed.confidence),
    };
  }
}

function resolveProperty(property: Property | null, properties: Property[]): Property | null {
  return property ?? properties[0] ?? null;
}
function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0.7));
}
