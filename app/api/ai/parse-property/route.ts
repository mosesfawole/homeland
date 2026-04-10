import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getRequestIp, checkRateLimit } from "@/lib/security";
import Anthropic from "@anthropic-ai/sdk";

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const inputSchema = z.object({
  description: z.string().min(10, "Description too short").max(2000),
});

// Maps common Nigerian shorthand to PropertyType enum values
const PROPERTY_TYPE_MAP: Record<string, string> = {
  "self contain": "SELF_CONTAIN",
  "self-contain": "SELF_CONTAIN",
  selfcontain: "SELF_CONTAIN",
  "mini flat": "MINI_FLAT",
  miniflat: "MINI_FLAT",
  duplex: "DUPLEX",
  "semi detached": "SEMI_DETACHED",
  "semi-detached": "SEMI_DETACHED",
  detached: "DETACHED",
  bungalow: "BUNGALOW",
  terraced: "TERRACED",
  terrace: "TERRACED",
  penthouse: "PENTHOUSE",
  studio: "STUDIO",
  apartment: "APARTMENT",
  flat: "APARTMENT",
  office: "OFFICE",
  land: "LAND",
  warehouse: "WAREHOUSE",
  shop: "SHOP",
};

const outputSchema = z
  .object({
    title: z.string().min(3).max(60),
    propertyType: z.enum([
      "APARTMENT",
      "SELF_CONTAIN",
      "MINI_FLAT",
      "DUPLEX",
      "BUNGALOW",
      "TERRACED",
      "DETACHED",
      "SEMI_DETACHED",
      "PENTHOUSE",
      "STUDIO",
      "OFFICE",
      "LAND",
      "WAREHOUSE",
      "SHOP",
    ]),
    listingType: z.enum(["RENT", "SALE"]),
    bedrooms: z.number().int().min(0).max(20).nullable(),
    bathrooms: z.number().int().min(0).max(20).nullable(),
    location: z.string().min(2),
    city: z.string().min(2).nullable(),
    state: z.string().min(2).nullable(),
    price: z.number().min(0).nullable(),
    rentDuration: z.enum(["year", "month"]).nullable(),
    features: z.array(z.string()).max(30),
    neighborhood: z.string().nullable(),
  })
  .strict();

const parseNumber = (value: unknown): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[\s,]/g, "");
    const num = Number(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  return null;
};

const SYSTEM_PROMPT = `You are a Nigerian real estate data extraction expert.

Your job is to parse a property listing description and extract structured data.

## STRICT RULES:
1. Return ONLY valid JSON - no markdown, no explanation, no extra text
2. NEVER hallucinate data that is not in the description
3. If a field cannot be determined, return null for that field
4. Numbers must be actual numbers (not strings)

## PRICE EXTRACTION:
- "2M" or "2 million" = 2000000
- "1.5M" = 1500000
- "500k" or "500K" = 500000
- "N2,000,000" = 2000000
- "2m per year" -> price: 2000000, rentDuration: "year"
- "150k per month" -> price: 150000, rentDuration: "month"
- If no duration mentioned but it's a rental, default to "year"
- If it's a sale listing, rentDuration: null

## PROPERTY TYPES (use these exact values):
APARTMENT, SELF_CONTAIN, MINI_FLAT, DUPLEX, BUNGALOW, TERRACED,
DETACHED, SEMI_DETACHED, PENTHOUSE, STUDIO, OFFICE, LAND, WAREHOUSE, SHOP

## NIGERIAN REAL ESTATE TERMS:
- "self contain" = SELF_CONTAIN (one room with private bathroom/kitchen)
- "mini flat" = MINI_FLAT (living room + bedroom + kitchen)
- "BQ" or "boys quarter" = servant quarters, note in features
- "serviced" = serviced apartment, add to features
- "fully furnished" = add to features
- "semi furnished" = add to features

## LISTING TYPE:
- "for rent", "per year", "per month", "to let" = "RENT"
- "for sale", "outright", "asking price" = "SALE"
- If unclear, default to "RENT"

## LOCATION:
- Extract the most specific location (e.g., "Lekki Phase 1" not just "Lagos")
- Common areas: Lekki, VI, Ikoyi, Ajah, Yaba, Surulere, Ikeja, Gbagada, etc.

## FEATURES (extract all mentioned):
Examples: "24hr power", "running water", "security", "CCTV", "gym",
"swimming pool", "generator", "prepaid meter", "serviced",
"fully furnished", "air conditioning", "parking space", "POP ceiling",
"boys quarter", "swimming pool", "elevator", "backup power"

## OUTPUT SCHEMA (return exactly this):
{
  "title": "string - concise listing title, max 60 chars",
  "propertyType": "one of the enum values above",
  "listingType": "RENT or SALE",
  "bedrooms": number or null,
  "bathrooms": number or null,
  "location": "string - specific area name",
  "city": "string - city name",
  "state": "string - state name",
  "price": number or null,
  "rentDuration": "year" or "month" or null,
  "features": ["array", "of", "strings"],
  "neighborhood": "string or null - estate/phase name if mentioned"
}`;

async function callAnthropic(description: string) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      ok: false,
      status: 500,
      message: "Missing ANTHROPIC_API_KEY in environment.",
    } as const;
  }

  const message = await anthropicClient.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Parse this Nigerian property listing:\n\n"${description}"`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "";
  return { ok: true, text } as const;
}

async function callOpenRouter(description: string) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    "http://localhost:3000";

  if (!apiKey) {
    return {
      ok: false,
      status: 500,
      message: "Missing OPENROUTER_API_KEY in environment.",
    } as const;
  }

  if (!model) {
    return {
      ok: false,
      status: 500,
      message: "Missing OPENROUTER_MODEL in environment.",
    } as const;
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": baseUrl,
      "X-OpenRouter-Title": "Homeland",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Parse this Nigerian property listing:\n\n"${description}"`,
        },
      ],
    }),
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    return {
      ok: false,
      status: res.status,
      message:
        payload?.error?.message ??
        "OpenRouter request failed. Please try again.",
    } as const;
  }

  const text = payload?.choices?.[0]?.message?.content ?? "";
  return { ok: true, text } as const;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getRequestIp(req);
    const limit = await checkRateLimit(`ai-parse:${ip}`, 10, 60_000);
    if (!limit.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((limit.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    // Only authenticated agents can use this endpoint
    const session = await auth();
    const role = session?.user?.role;
    if (role !== "AGENT") {
      return NextResponse.json(
        { error: "Unauthorized. Only agents can use this feature." },
        { status: 401 },
      );
    }

    const body = await req.json();
    const parsed = inputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0].message },
        { status: 400 },
      );
    }

    const { description } = parsed.data;

    const provider = (process.env.AI_PROVIDER ?? "").toLowerCase();
    const useOpenRouter =
      provider === "openrouter" ||
      (!!process.env.OPENROUTER_API_KEY && provider !== "anthropic");

    const aiResponse = useOpenRouter
      ? await callOpenRouter(description)
      : await callAnthropic(description);

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: aiResponse.message },
        { status: aiResponse.status },
      );
    }

    const text = aiResponse.text;

    // Strip any accidental markdown fences
    const clean = text.replace(/```json|```/g, "").trim();
    const parsedResult = JSON.parse(clean);

    const normalized = { ...parsedResult } as Record<string, unknown>;

    if (typeof normalized.propertyType === "string") {
      const lower = normalized.propertyType.toLowerCase();
      normalized.propertyType =
        PROPERTY_TYPE_MAP[lower] ?? normalized.propertyType.toUpperCase();
    }

    if (typeof normalized.listingType === "string") {
      normalized.listingType = normalized.listingType.toUpperCase();
    }

    if (typeof normalized.rentDuration === "string") {
      normalized.rentDuration = normalized.rentDuration.toLowerCase();
    }

    normalized.bedrooms = parseNumber(normalized.bedrooms);
    normalized.bathrooms = parseNumber(normalized.bathrooms);
    normalized.price = parseNumber(normalized.price);

    if (Array.isArray(normalized.features)) {
      normalized.features = normalized.features
        .map((feature) => (typeof feature === "string" ? feature.trim() : ""))
        .filter(Boolean);
    } else {
      normalized.features = [];
    }

    if (typeof normalized.neighborhood === "string") {
      normalized.neighborhood = normalized.neighborhood.trim() || null;
    }

    const parsedOutput = outputSchema.safeParse(normalized);

    if (!parsedOutput.success) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough information from the description. Please add more detail.",
        },
        { status: 422 },
      );
    }

    if (!parsedOutput.data.title || !parsedOutput.data.location) {
      return NextResponse.json(
        {
          error:
            "Could not extract enough information from the description. Please add more detail.",
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ data: parsedOutput.data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[POST /api/ai/parse-property]", message);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI returned unexpected output. Please try again." },
        { status: 500 },
      );
    }

    if (
      message.toLowerCase().includes("credit balance is too low") ||
      message.toLowerCase().includes("insufficient") ||
      message.toLowerCase().includes("billing")
    ) {
      return NextResponse.json(
        { error: "AI credits are exhausted. Please top up billing." },
        { status: 402 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to parse property description.",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : {}),
      },
      { status: 500 },
    );
  }
}
